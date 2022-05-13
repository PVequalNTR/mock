import { Model, Router } from "../deps.ts";

import User from "../models/User.ts";
import hash from "../utils/hash.ts";
import token from "../utils/token.ts";

const router = new Router();

// shorten code
async function errorResponse(
  ctx: any,
  text: string,
  status: number,
): Promise<boolean> {
  ctx.response.status = status;
  ctx.response.body = text;
  return true;
}

/**
 * @api {get} /name/:name get user by name
 * token in header is required
 */
router.get("/name/:name", async (ctx) => {
  let authUser = await token.checkHeader(ctx);
  if (!authUser) {
    await errorResponse(ctx, "Unauthorized", 401);
    return;
  }
  const user = new User();
  user.where("name", ctx.params.name);
  await user.first();
  if (user.found) ctx.response.body = user.getSanitzedValue();
  else await errorResponse(ctx, "Not found", 404);
});

/**
 * @api {get} /id/:id user by id
 * token in header is required
 */
router.get("/id/:id", async (ctx) => {
  let authUser = await token.checkHeader(ctx);
  if (!authUser) {
    await errorResponse(ctx, "Unauthorized", 401);
    return;
  }
  const user = new User();
  user.where("id", ctx.params.id);
  await user.first();
  if (user.found) ctx.response.body = user.getSanitzedValue();
  else await errorResponse(ctx, "Not found", 404);
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
    if (user == false) return;
    if (user.privilege! < body.privilege) {
      await errorResponse(ctx, "Insufficient privilege", 403);
      return;
    }
  }
  if (!body.name || !body.password) {
    await errorResponse(ctx, "Required parameters not provided", 400);
  } else if (body.name.length > 64 || body.password.length > 128) {
    await errorResponse(ctx, "Required parameters too long", 400);
  } else {
    await new User().create({
      name: body.name,
      hashedPassword: await hash(body.password),
      privilege: body.privilege,
    });
    ctx.response.status = 201;
    ctx.response.body = "Success";
  }
});

/**
 * @api {delete} / delete a user and its own active token
 * @field {string} name - User name
 * @field {string} password - User password
 */
router.delete("/", async (ctx) => {
  const body = await ctx.request.body({ type: "json" }).value;
  if (!body.name || !body.password) {
    await errorResponse(ctx, "Required parameters not provided", 400);
  } else {
    // perform a login active
    const user = new User();
    user.where("name", body.name);
    user.where("hashedPassword", await hash(body.password));
    await user.first();
    if (!user.found) await errorResponse(ctx, "Unauthorized", 401);
    else {
      // once user has been deleted, add releative thing in sqlite will automatically get deleted
      await token.deleteByUser(user.id);
      ctx.response.status = 202;
      ctx.response.body = "Success";
      await user.delete();
    }
  }
});

export default router;
