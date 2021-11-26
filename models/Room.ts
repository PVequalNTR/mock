import { Model, DataTypes } from "../deps.ts";
class Room extends Model {
  static table = "room";
  static timestamps = true;
  static fields = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    name: DataTypes.string(50),
    members: DataTypes.JSON,
  };
  static defaults = {
    name: "default room name",
  };
}

export default Room;
