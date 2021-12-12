import Post from "../db/schemas/Post.ts";
import getSchemaLayer from "./template.ts";

export default getSchemaLayer(Post, { secretData: ["privilege", "path"], addOnData: ["userId"] });
