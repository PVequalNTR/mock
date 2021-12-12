import { Database, SQLite3Connector, Relationships } from "../deps.ts";
import { config } from "../deps.ts";
import { ensureDir } from "../deps.ts";

import User from "../db/schemas/User.ts";
import Token from "../db/schemas/Token.ts";
import Post from "../db/schemas/Post.ts";
import Book from "../db/schemas/Book.ts";

await ensureDir("./" + config().STORAGE_PATH);
const sqlitePath = config().STORAGE_PATH.replace(/\/$/, "") + "/db.sqlite";

const connector = new SQLite3Connector({
  filepath: sqlitePath,
});

const db = new Database(connector);

Relationships.belongsTo(Token, User);
Relationships.belongsTo(Post, User);
Relationships.belongsTo(Book, User);
Relationships.belongsTo(Book, Post);

db.link([Token, User, Post, Book]);

if (config().ENVIRONMENT == "development") await db.sync({ drop: true });
else await db.sync();

// delete token
await Promise.all((await Token.where("id", ">", "-1").all()).map((x) => x.delete()));

export default db;
