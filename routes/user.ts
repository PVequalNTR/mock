import { Router } from "../deps.ts";

import User from "../models/User.ts";
import sha256 from "../utils/sha256.js";
import token from "../utils/token.ts";

const router = new Router();

// Models: Database models

router.get("/name/:name", async (ctx) => {
  const dbResultArr = User.where("name", "" + ctx.params.name);
  const target = await dbResultArr.first();
  if (target) {
    delete target.hashedPassword;
    ctx.response.body = target;
  } else {
    ctx.response.status = 404;
  }
});

/**
 * @api {post} s/login Get all users
 * @field {string} name - User name
 * @field {string} password - User password
 * @response {string} user - token for 1 hour with privilege higher than -1
 */
router.post("/login", async (ctx) => {
  const body = await ctx.request.body({ type: "json" }).value;
  if (!body.name || !body.password) {
    ctx.response.status = 401;
    ctx.response.body = "Required parameters not provided";
    return;
  }
  const targets = await User.where("name", "" + body.name)
    .where("hashedPassword", sha256(body.password))
    .first();
  if (!targets) {
    ctx.response.status = 404;
    ctx.response.body = "Invalid username or password";
  } else {
    const ttl = 3600 * 1000;
    // deno-lint-ignore no-explicit-any
    const token_ = token.generate(targets as any, ttl);
    ctx.response.body = {
      token: token_,
      expiredAt: Date.now() + ttl,
    };
  }
});

/**
 * @api {post} /register Register a new user
 * @field {string} name - User name
 * @field {string} password - User password
 * @field {number} privilege - User privilege (optional)
 * @field {string} token - Creator's token (optional)
 */
router.post("/register", async (ctx) => {
  const body = await ctx.request.body({ type: "json" }).value;
  if (!body.name || !body.password) {
    ctx.response.status = 400;
    ctx.response.body = "Required parameters not provided";
  } else if (body.token && body.privilege) {
    // const creator = await User.where("token", "" + body.token).first();
    const creator = token.verify(body.token);
    if (!creator) {
      ctx.response.status = 401;
      ctx.response.body = {
        message: "Invalid token",
      };
      return;
    }
    if (creator.privilege! < body.privilege) {
      ctx.response.status = 401;
      ctx.response.body = "Higher privilege required";

      return;
    }
    User.create({
      name: body.name,
      hashedPassword: sha256(body.password),
      privilege: body.privilege,
    });
    token.delete(body.token);
    ctx.response.body =
      "registered user with " + body.privilege + " level privilege";
  } else {
    User.create({
      name: body.name,
      hashedPassword: sha256(body.password),
      privilege: 0,
    });
    token.delete(body.token);
    ctx.response.body = "registered user 0 level privilege";
  }
});

/**
 * @api {delete} /token/:token Get user by token
 * @field {string} name - User name
 * @field {string} password - User password
 * @field {string} token - User's token
 */
router.delete("/delete", async (ctx) => {
  const body = await ctx.request.body({ type: "json" }).value;
  // check if required parameters were provided
  if (!body.name || !body.password || !body.token) {
    ctx.response.status = 401;
    ctx.response.body = "Required parameters not provided";

    return;
  }
  // find users by token, name and password
  const databaseUser = await User.where("name", body.name)
    .where("hashedPassword", sha256(body.password))
    .first();
  const tokenUser = token.verify(body.token);
  if (!databaseUser || !tokenUser) {
    ctx.response.status = 401;
    ctx.response.body = "Invalid token or password";

    return;
  }
  // verify
  const verifyColums = ["name", "hashedPassword", "privilege"];
  let examine = true;
  for (const key in databaseUser) {
    if (
      verifyColums.includes(key) &&
      Object.prototype.hasOwnProperty.call(databaseUser, key)
    ) {
      if (tokenUser[key] != databaseUser[key]) {
        examine = false;
        break;
      }
    }
  }
  if (!examine) {
    ctx.response.status = 401;
    ctx.response.body = {
      message: "Not same identity",
    };
    return;
  } else {
    databaseUser.delete();
    token.delete(body.token);
    ctx.response.body = {
      message: "success",
    };
    return;
  }
});

export default router;
