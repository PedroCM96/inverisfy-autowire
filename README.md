# Autowire script for inversify using typescript
## Dependencies
* ts-morph
* inversify
## Explanation
WARNING! Use only for test environments. It's not performance friendly at all.

From DI packages like inversify it bothers me that I have to use decorators like @injectable to have advantages like autoinject or autowire dependencies, especially if I work isolating the domain code in its own package, and I don't like to put these infrastructural details in it. 

To do this, this script goes through my project files adding these decorators like @inject where necessary, making it possible to autowire without using these decorators.

## How to use
```typescript
import { autowire } from "./autowire";
import { Container } from "inversify";
import "reflect-metadata";

    const autowiredBindings:  [DI_SYMBOL, Newable<unknown>][] = [
        // Repositories
        ['Symbol', SymbolImplementation],
       ...
]

const container = new Container();
autowire(container,autowiredBindings);

