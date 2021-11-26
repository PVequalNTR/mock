import { Database, SQLite3Connector } from "../deps.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";

config({ export: true });

import Room from "../models/Room.ts";
import User from "../models/User.ts";

const connector = new SQLite3Connector({
  filepath: "./db/test.sqlite",
});

const db = new Database(connector);

db.link([Room, User]);

export default db;
