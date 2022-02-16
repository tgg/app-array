export type Context = {
    [key: string]: any;
}

// That's how to extend a type :-)
export type Environment = Context & { id: string }
