import User from "../db/schemas/User.ts";
import getSchemaLayer from "./template.ts";

export default getSchemaLayer(User, { secretData: ["hashedPassword"] });
