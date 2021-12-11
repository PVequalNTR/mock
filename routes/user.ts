import { Model, Router } from "../deps.ts";

import User from "../models/User.ts";
import hash from "../utils/hash.ts";
import token from "../utils/token.ts";

const router = new Router();

// shorten code
async function errorResponse(ctx: any, text: string, status: number): Promise<boolean> {
  ctx.response.status = status;
  ctx.response.body = text;
  return true;
}

/**
 * @api {get} /name/:name Get all users
 * token in header is required
 */
router.get("/name/:name", async (ctx) => {
  let user = await token.checkHeader(ctx);
  if (!user) {
    await errorResponse(ctx, "Unauthorized", 401);
    return;
  }
  const dbResultArr = User.where("name", "" + ctx.params.name);
  const target = await dbResultArr.first();
  if (target) {
    delete target.hashedPassword;
    ctx.response.body = target;
  } else {
    errorResponse(ctx, "Not Found", 404);
  }
});

/**
 * token in header is required
 */
router.get("/id/:id", async (ctx) => {
  let user = await token.checkHeader(ctx);
  if (!user) {
    await errorResponse(ctx, "Unauthorized", 401);
    return;
  }
  const dbResultArr = User.where("id", "" + ctx.params.id);
  const target = await dbResultArr.first();
  if (target) {
    delete target.hashedPassword;
    ctx.response.body = target;
  } else {
    errorResponse(ctx, "Not Found", 404);
  }
});

/**
 * @api {post} /login login Get all users
 * @field {string} name - User name
 * @field {string} password - User password
 * @response {string} user - token for 1 hour with privilege higher than -1
 */
router.post("/login", async (ctx) => {
  const body = await ctx.request.body({ type: "json" }).value;
  if (!body.name || !body.password) {
    errorResponse(ctx, "Required parameters not provided", 404);
    return;
  }
  const targets = await User.where("name", "" + body.name)
    .where("hashedPassword", await hash(body.password))
    .first();
  if (!targets) {
    errorResponse(ctx, "Invalid username or password", 401);
  } else {
    const ttl = 3600 * 1000;
    const token_ = await token.generate(+targets.id!, ttl);
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
 * token in header is required
 */
router.post("/register", async (ctx) => {
  const body = await ctx.request.body({ type: "json" }).value;
  body.privilege = +body.privilege || 0;
  let user;
  if (body.privilege > 0) {
    user = await token.checkHeader(ctx);
    // console.log(user);
    if (user == false) return;
    if (user.privilege! < body.privilege) {
      await errorResponse(ctx, "Insufficient privilege", 403);
      return;
    }
  }
  if (!body.name || !body.password) await errorResponse(ctx, "Required parameters not provided", 400);
  else if (body.name.length > 64 || body.password.length > 128) errorResponse(ctx, "Required parameters too long", 400);
  else if (await User.where("name", "" + body.name).first()) await errorResponse(ctx, "User already exists", 400);
  // warning: input value may contain forbidden characters.
  // else if (
  //   !/^[a-zA-Z \.]+$/.test(body.name) ||
  //   !/^[a-zA-Z \.]+$/.test(body.password)
  // )
  //   errorResponse(ctx, "Forbidden character", 400);
  else {
    await User.create({
      name: body.name,
      hashedPassword: await hash(body.password),
      privilege: body.privilege,
    });
    ctx.response.status = 201;
    ctx.response.body = "success";
  }
});

/**
 * @api {delete} / delete a user and its own active token
 * @field {string} name - User name
 * @field {string} password - User password
 */
router.delete("/", async (ctx) => {
  const body = await ctx.request.body({ type: "json" }).value;
  if (!body.name || !body.password) await errorResponse(ctx, "Required parameters not provided", 400);
  else {
    const databaseUser = await User.where("name", body.name)
      .where("hashedPassword", await hash(body.password))
      .first();
    if (!databaseUser) await errorResponse(ctx, "Unauthorized", 401);
    else {
      // delete tokens
      let tokens = await User.where("id", "" + databaseUser.id).tokens();
      Promise.all(tokens.map((token) => token.delete()));
      // delete user
      await databaseUser.delete();
      ctx.response.status = 200;
      ctx.response.body = "success";
    }
  }
});

export default router;
