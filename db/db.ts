import { Database, SQLite3Connector, Relationships } from "../deps.ts";
import { config } from "../deps.ts";

import Room from "../models/Room.ts";
import User from "../models/User.ts";
import Token from "../models/Token.ts";
import RoomUser from "../models/RoomUser.ts";

const connector = new SQLite3Connector({
  filepath: "./db/test.sqlite",
});

const db = new Database(connector);

Relationships.belongsTo(Token, User);

db.link([Token, Room, User, RoomUser]);

if (config().ENVIRONMENT == "development") await db.sync({ drop: true });
else await db.sync();

// delete token
await Promise.all(
  (await Token.where("id", ">", "-1").all()).map((x) => x.delete())
);

export default db;
