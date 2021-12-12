import { Model, DataTypes } from "../../deps.ts";
import Token from "../schemas/Token.ts";
import Post from "../schemas/Post.ts";
import Book from "../schemas/Book.ts";
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
    name: "name",
    hashedPassword: "hashedPassword(salted sha512)",
    privilege: 0,
  };
  static tokens(): Model[] {
    return this.hasMany(Token) as any;
  }
  static books(): Model[] {
    return this.hasMany(Book) as any;
  }
  static posts(): Model[] {
    return this.hasMany(Post) as any;
  }
}

export default User;
