export type Context = {
    [key: string]: string;
}

// That's how to extend a type :-)
export type Environment = Context & { id: string }
