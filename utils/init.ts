import { Router } from "../deps.ts";
import { config } from "../deps.ts";

import User from "../db/schemas/User.ts";
import Book from "../db/schemas/Book.ts";
import hash from "../utils/hash.ts";
import Token from "../db/schemas/Token.ts";
import getTime from "../utils/time.ts";

const router = new Router();

let defaultUser = {
  name: "" + config().DEFAULT_NAME || "admin",
  password: "" + config().DEFAULT_PASSWORD || "default",
};

setTimeout(async () => {
  await production();
  if (config().ENVIRONMENT == "development") await testSuite();
}, 2000);

// for production
// 1. add default user
async function production() {
  if (!(await User.where("name", defaultUser.name).first())) {
    await User.create({
      name: defaultUser.name,
      hashedPassword: await hash(defaultUser.password),
      privilege: 2,
    });
  } else console.log("admin user already exists");
  // make sure book(id:0) exists and is not deleted(if admin don't do that)
  if (await Book.where("id", 1).first()) {
    console.log("book(id:1) already exists");
  } else {
    await Book.create({
      title: "System reserved",
      description: "System reserved",
      privilege: 2,
      lastModified: 0,
      userId: 1,
    });
  }
}

// for test
// 1. add default token
async function testSuite() {
  const adminToken =
    "MbwqeaEzG4N3XqdSTC40NgGtAR64asufTPhennmeOAtKPvrdydul3k7jWKi6K1Ku";
  let admin = await User.where("name", defaultUser.name).first();
  const token_ttl = 365 * 24 * 60 * 60 * 1000;
  await Token.create({
    ttl: token_ttl, // absolutely never expires
    userId: +admin.id!,
    expire: getTime() + token_ttl,
    value: adminToken,
  });
  console.log("admin token added: " + adminToken);
}

export default router;
