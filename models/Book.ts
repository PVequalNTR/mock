import { Model, DataTypes } from "../deps.ts";
import Post from "../models/Post.ts";
class Book extends Model {
  static table = "book";
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
  static tokens(): Model[] {
    return this.hasMany(Post) as any;
  }
}

export default Book;
