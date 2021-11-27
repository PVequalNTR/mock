import { Model, DataTypes } from "../deps.ts";
import User from "./User.ts";
class Room extends Model {
  static table = "room";
  static timestamps = true;
  static fields = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.string(50),
  };
  static defaults = {
    name: "default room name",
  };
  static users() {
    return this.hasMany(User);
  }
}

export default Room;
