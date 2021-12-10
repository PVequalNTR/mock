import { Model, DataTypes } from "../deps.ts";
import Post from "../models/Post.ts";
import User from "../models/User.ts";
class Book extends Model {
  static table = "book";
  static timestamps = true;
  static fields = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: DataTypes.string(64),
    description: DataTypes.string(256),
    privilege: DataTypes.INTEGER,
  };
  static defaults = {
    title: "title",
    description: "description",
    privilege: 0,
  };
  static posts(): Model[] {
    return this.hasMany(Post) as any;
  }
  static user() {
    return this.hasOne(User);
  }
}

export default Book;
