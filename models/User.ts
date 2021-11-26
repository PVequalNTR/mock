import { Model, DataTypes } from "../deps.ts";
class User extends Model {
  static table = "user";
  static timestamps = true;
  static fields = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true, // ?
    },
    name: DataTypes.string(50),
    hashedPassword: DataTypes.string(64), // sorry, but sqlite doesn't support 32-bit binary strings(for sha256)
    privilege: DataTypes.INTEGER,
    rooms: DataTypes.JSON,
  };
  static defaults = {
    name: "default",
    hashedPassword:
      "37a8eec1ce19687d132fe29051dca629d164e2c4958ba141d5f4133a33f0688f", // sha256("default")
    privilege: 0,
    rooms: "[]",
  };
}

export default User;
