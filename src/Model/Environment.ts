import { EnvironmentOptions } from "../Components/StatusBar/EnvironmentComboBox";

export type Context = {
    [key: string]: Map<string, string>;
}

// That's how to extend a type :-)
export type Environment = { id: string, context: Context }

export const formattedId = (environment: Environment): string => {
    return environment.id.replaceAll(" ", "_");
}

export const environmentsToOptions = (paths: String[], environments?: Environment[]): EnvironmentOptions[] => {
    let options:EnvironmentOptions[] = [];
    if(environments !== undefined)
        environments!.forEach(e => { 
            const id = formattedId(e);
            const foundPaths = paths.filter(p => p.includes(id));
            if(foundPaths?.length !== undefined && foundPaths?.length > 0) {
                options.push({ value: e.id, label: e.id, path: foundPaths?.at(0)! })
            }
        });
    return options;
}