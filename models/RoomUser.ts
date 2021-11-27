import { Relationships } from "../deps.ts";

import Room from "../models/Room.ts";
import User from "../models/User.ts";

const ruTable = Relationships.manyToMany(Room, User);

export default ruTable;
