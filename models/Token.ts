import { Model, DataTypes, Relationships } from "../deps.ts";
import User from "../models/User.ts";
class Token extends Model {
  static table = "token";
  static timestamps = true;
  static fields = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ttl: DataTypes.INTEGER,
    value: DataTypes.string(32),
  };
  static defaults = { ttl: 0, value: "" };
  static user() {
    return this.hasOne(User);
  }
}

export default Token;
