import {Container, decorate, inject, injectable, interfaces} from "inversify";
import {Project} from "ts-morph";
import {DI_SYMBOL} from "./di";
import Newable = interfaces.Newable;

type ConstructorParam = {
    name: string,
    type: string,
    isClass: boolean
}

type Binding = [DI_SYMBOL, Newable<unknown>]
const alreadyBoundClassNames: string[] = [];

function autowire(container: Container, bindings: Binding[]) {
    const project = new Project();
    project.addSourceFilesAtPaths(['../../source/**/*.ts', '../../infrastructure/**/*.ts', './source/**/*.ts']);

    for (const binding of bindings) {
        const constructor = binding[1];
        const location = findClassLocation(project, constructor.name);
        if (typeof location === 'undefined') {
            throw new Error(`Can not find file for class ${constructor.name}`);
        }

        if (!alreadyBoundClassNames.includes(constructor.name)) {
            decorateClass(project, container, constructor, location);
            alreadyBoundClassNames.push(constructor.name);
        }

        container.bind(binding[0]).to(constructor);
    }
}

function findClassLocation(project: Project, className: string): string | undefined {
    for (const sourceFile of project.getSourceFiles()) {
        const classDeclaration = sourceFile.getClass(className);
        if (classDeclaration) {
            return sourceFile.getFilePath();
        }
    }
    return undefined;
}

function decorateClass(project: Project, container: Container, constructor: Newable<unknown>, location: string): void {
    decorate(injectable(), constructor);
    const constructorParams = findFileClassProperties(project, location, constructor.name);
    for (let i = 0; i < constructorParams.length; i++) {
        const param = constructorParams[i];
        decorate(inject(param.type), constructor, i);
    }
}

function findFileClassProperties(project: Project, path: string, className: string): ConstructorParam[] {
    const sourceFile = project.getSourceFileOrThrow(path);
    const classDeclaration = sourceFile.getClass(className);
    const parameters = classDeclaration?.getConstructors()[0]?.getParameters();
    if (!parameters) {
        return [];
    }
    const constructorParams: ConstructorParam[] = []
    for (const parameter of parameters ?? []) {
        const name = parameter.getName();
        const parameterFullType = parameter.getType().getText();
        const type = parameterFullType.split('.')[parameterFullType.split('.').length - 1];
        constructorParams.push({name, type, isClass: parameter.getType().isClass()});
    }

    return constructorParams;
}

export {Binding, autowire}
