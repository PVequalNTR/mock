import { Database, SQLite3Connector, Relationships } from "../deps.ts";
import { config } from "../deps.ts";

config({ export: true });

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

await db.sync({ drop: true });

export default db;
