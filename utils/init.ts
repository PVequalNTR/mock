import { Router } from "../deps.ts";

import User from "../models/User.ts";
import sha512 from "../utils/sha512.ts";
import Token from "../models/Token.ts";

const router = new Router();

console.log("initing development mode");
// initialize test data at once
// use setTimeout or you might probably get a "The current query does not have any where clause for this model primary key." error
// bc it's not initialized yet
setTimeout(async () => {
  if (!(await User.where("name", "admin").first())) {
    await User.create({
      name: "admin",
      hashedPassword: await sha512("default"),
      privilege: 2,
    });
  } else console.log("admin user already exists");
  let admin = await User.where("name", "admin").first();
  await Token.create({
    ttl: 3600000,
    userId: +admin.id!,
    value: "uqsylkrea5y6vx0xig6jhojgy3lagub9",
  });
}, 1000);

router.get("/hello", (ctx) => {
  ctx.response.body = "Hello World!";
});

export default router;
