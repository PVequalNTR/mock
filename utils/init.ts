import { Router } from "../deps.ts";
import { config } from "../deps.ts";

import User from "../models/User.ts";
import hash from "../utils/hash.ts";
import Token from "../models/Token.ts";
import token from "../utils/token.ts";

const router = new Router();

let defaultUser = {
  name: "" + config().DEFAULT_NAME || "admin",
  password: "" + config().DEFAULT_PASSWORD || "default",
};

setTimeout(async () => {
  await production();
  if (config().ENVIRONMENT == "development") await testSuite();
}, 4000);

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
}

// for test
// 1. add default token
async function testSuite() {
  const adminToken =
    "MbwqeaEzG4N3XqdSTC40NgGtAR64asufTPhennmeOAtKPvrdydul3k7jWKi6K1Ku";
  let admin = await User.where("name", defaultUser.name).first();
  await Token.create({
    ttl: 1e10, // absolutely never expires
    userId: +admin.id!,
    value: adminToken,
  });
  console.log("admin token added: " + adminToken);
}

export default router;
