import { Model, DataTypes } from "../deps.ts";
import Room from "./Room.ts";
import Token from "../models/Token.ts";
class User extends Model {
  static table = "user";
  static timestamps = true;
  static fields = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.string(50),
    hashedPassword: DataTypes.string(64),
    privilege: DataTypes.INTEGER,
  };
  static defaults = {
    privilege: 0,
  };
  static rooms() {
    return this.hasMany(Room);
  }
  static tokens() {
    return this.hasMany(Token);
  }
}

export default User;
