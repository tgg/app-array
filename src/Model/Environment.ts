export type Context = {
    [key: string]: Map<string, string>;
}

// That's how to extend a type :-)
export type Environment = { id: string, context: Context }
