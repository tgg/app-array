import * as dotenv from "dotenv";

dotenv.config();
let path;
switch (process.env.NODE_ENV) {

  default:
    path = `${__dirname}/../../.env`;
}
dotenv.config({ path: path });

export const REACT_APP_BACKEND_HOST = process.env.REACT_APP_BACKEND_HOST;
