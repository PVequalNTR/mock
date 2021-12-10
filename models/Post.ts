import { Model, DataTypes, Relationships } from "../deps.ts";
import Book from "../models/Book.ts";
class Post extends Model {
  static table = "post";
  static timestamps = true;
  static fields = {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ttl: DataTypes.INTEGER,
    expire: DataTypes.INTEGER,
    value: DataTypes.string(64),
  };
  static defaults = { ttl: 0, value: "" };
  static user() {
    return this.hasOne(Book);
  }
}

export default Post;
