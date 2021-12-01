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
    name: DataTypes.string(64),
    hashedPassword: DataTypes.string(64),
    privilege: DataTypes.INTEGER,
  };
  static defaults = {
    privilege: 0,
  };
  static rooms(): Model {
    return this.hasMany(Room) as any;
  }
  static tokens(): Model[] {
    return this.hasMany(Token) as any;
  }
}

export default User;
