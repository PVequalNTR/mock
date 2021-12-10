import { Model, Router } from "../deps.ts";

import Post from "../models/Post.ts";
import token from "../utils/token.ts";

import bucket from "../utils/bucket.ts";

const router = new Router();

// shorten code
async function errorResponse(ctx: any, text: string, status: number): Promise<boolean> {
  ctx.response.status = status;
  ctx.response.body = text;
  return true;
}

/**
 * token in header is required
 */
router.get("/title/:title", async (ctx) => {
  let user = await token.checkHeader(ctx);
  if (!user) {
    await errorResponse(ctx, "Unauthorized", 401);
    return;
  }
  const dbResultArr = Post.where("title", "" + ctx.params.title);
  const target = await dbResultArr.first();
  if (target) {
    delete target.privilege;
    ctx.response.body = target;
  } else {
    errorResponse(ctx, "Not Found", 404);
  }
});

/**
 * @api {post} /register create a new Post
 * @field {string} title - title
 * @field {string} description - description (optional)
 * @field {number} privilege - privilege requirement(should be below user's privilege) (optional)
 * token in header is required
 */
router.post("/create", async (ctx) => {
  const body = await ctx.request.body({ type: "json" }).value;
  body.title = body.title || "title";
  body.description = body.description || "description";
  body.privilege = +body.privilege || 0;
  let user = await token.checkHeader(ctx);
  if (user == false) errorResponse(ctx, "Unauthorized", 401);
  else if (user.privilege! < body.privilege) await errorResponse(ctx, "Insufficient privilege", 403);
  else if (body.title.length > 64 || body.description.length > 128) errorResponse(ctx, "Required parameters too long", 400);
  else if (await Post.where("title", "" + body.title).first())
    await errorResponse(ctx, "Required parameters missing or post already exists", 400);
  // warning: input value may contain forbidden characters.
  else {
    await Post.create({
      userId: "" + user.id,
      title: body.title,
      description: body.description,
      privilege: body.privilege,
    });
    ctx.response.status = 201;
    ctx.response.body = "success";
  }
});

/**
 * @api {post} /register create a new Post
 * @field {string} title - title
 * @field {string} description - description (optional)
 * @field {number} privilege - privilege requirement(should be below user's privilege) (optional)
 * @field {string} content - a large string
 * token in header is required
 */
router.patch("/", async (ctx) => {
  const body = await ctx.request.body({ type: "json" }).value;
  let user = await token.checkHeader(ctx);
  if (user == false) {
    errorResponse(ctx, "Unauthorized", 401);
    return;
  }
  let post = await Post.where("userId", "" + user.id!)
    .where("title", "" + body.title)
    .first();
  if (!post) errorResponse(ctx, "Not Found", 404);
  else if (body.title.length > 64 || body.description.length > 128) errorResponse(ctx, "Required parameters too long", 400);
  // warning: input value may contain forbidden characters.
  else {
    let location = new bucket("post", +post.id!);
    if (body.content) {
      body.path = +post.id!;
      location.writeString(body.content);
    }
    delete body.content;
    ctx.response.status = 202;
    ctx.response.body = "success";
    await Post.where("userId", "" + user.id!)
      .where("title", "" + body.title)
      .update(body);
  }
});

export default router;
