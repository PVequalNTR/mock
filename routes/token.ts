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
 * @api {post} /new new user
 * @field {string} name - User name
 * @field {string} password - User password
 */
router.post("/new", async (ctx) => {
  const body = await ctx.request.body({ type: "json" }).value;
  if (!body.name || !body.password) {
    errorResponse(ctx, "Required parameters not provided", 404);
    return;
  }
  const user = new User();
  user.where("name", "" + body.name);
  user.where("hashedPassword", await hash(body.password));
  await user.first();
  if (!user.inited) {
    errorResponse(ctx, "Invalid username or password", 401);
  } else {
    const ttl = 3600 * 1000;
    const token_ = await token.generate(+user.data!.id, ttl);
    ctx.response.body = {
      token: token_,
      expiredAt: Date.now() + ttl,
    };
  }
});

/**
 * @api {delete} / delete delete token
 */
router.delete("/", async (ctx) => {
  let user = await token.checkHeader(ctx);
  if (user == false) errorResponse(ctx, "Invalid token", 401);
  else token.delete(ctx.request.headers.get("authentication")!);
  ctx.response.status = 202;
  ctx.response.body = "Success";
});

export default router;
