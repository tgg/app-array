import { Options } from "../Components/StatusBar/EnvironmentComboBox";

export type Context = {
    [key: string]: Map<string, string>;
}

// That's how to extend a type :-)
export type Environment = { id: string, context: Context }

export const environmentsToOptions = (environments?: Environment[]): Options[] => {
    let options:Options[] = [];
    if(environments !== undefined)
        environments!.forEach(e => options.push({ value: e.id, label: e.id }));
    return options;
}