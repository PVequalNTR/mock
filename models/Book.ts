import Book from "../db/schemas/Book.ts";
import getSchemaLayer from "./template.ts";

export default getSchemaLayer(Book, {
  secretData: ["privilege", "path"],
  addOnData: ["userId"],
});
