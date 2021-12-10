import { Database, SQLite3Connector, Relationships } from "../deps.ts";
import { config } from "../deps.ts";

import User from "../models/User.ts";
import Token from "../models/Token.ts";

const connector = new SQLite3Connector({
  filepath: config().SQLITE_PATH,
});

const db = new Database(connector);

Relationships.belongsTo(Token, User);

db.link([Token, User]);

if (config().ENVIRONMENT == "development") await db.sync({ drop: true });
else await db.sync();

// delete token
await Promise.all(
  (await Token.where("id", ">", "-1").all()).map((x) => x.delete())
);

export default db;
