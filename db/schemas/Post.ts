import { Model, DataTypes, Relationships } from "../../deps.ts";
import Book from "../schemas/Book.ts";
import User from "../schemas/User.ts";
class Post extends Model {
  static table = "post";
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
    path: DataTypes.INTEGER,
    lastModified: DataTypes.INTEGER,
  };
  static defaults = {
    title: "title",
    description: "description",
    privilege: 0,
    path: 0,
    lastModified: 0,
  };
  static book() {
    return this.hasOne(Book);
  }
  static user() {
    return this.hasOne(User);
  }
}

export default Post;
