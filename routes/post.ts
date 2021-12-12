import { Model, Router } from "../deps.ts";

import getTime from "../utils/time.ts";
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
 * @api {get} /title/:title get post info by title
 * token in header is required
 */
router.get("/title/:title", async (ctx) => {
  let user = await token.checkHeader(ctx);
  if (!user) {
    await errorResponse(ctx, "Unauthorized", 401);
    return;
  }
  let post = new Post();
  post.where("title", ctx.params.title);
  await post.first();
  if (post.inited) {
    ctx.response.body = post.getSanitzedValue();
  } else errorResponse(ctx, "Not found", 404);
});

/**
 * @api {get} /id/:id get post info by id
 * token in header is required
 */
router.get("/id/:id", async (ctx) => {
  let user = await token.checkHeader(ctx);
  if (!user) {
    await errorResponse(ctx, "Unauthorized", 401);
    return;
  }
  let post = new Post();
  post.where("id", ctx.params.id);
  await post.first();
  if (post.inited) {
    ctx.response.body = post.getSanitzedValue();
  } else errorResponse(ctx, "Not found", 404);
});

/**
 * @api {get} /read/:id read post content info by id
 * token in header is required
 */
router.get("/read/:id", async (ctx) => {
  let user = await token.checkHeader(ctx);
  if (!user) {
    await errorResponse(ctx, "Unauthorized", 401);
    return;
  }

  const post = new Post();
  post.where("id", ctx.params.id);
  await post.first();

  if (post.inited && post.data!.path != 0) {
    let content = await new bucket("post", +post.data!.path).getString();
    ctx.response.body = { content };
  } else errorResponse(ctx, "Not found", 404);
});

/**
 * @api {get} /query/description/:description search post info by description
 * token in header is required
 */
router.get("/latest", async (ctx) => {
  let user = await token.checkHeader(ctx);
  if (!user) {
    await errorResponse(ctx, "Unauthorized", 401);
    return;
  }
  let posts = new Post();
  posts.where("privilege", "<=", "" + user.privilege);
  posts.orderBy("lastModified", "asc");
  posts.limit(10);
  await posts.all();
  ctx.response.body = { query: posts.data || [] };
});

/**
 * @api {post} /create create a new Post
 * @field {string} title - title
 * @field {string} description - description (optional)
 * @field {number} privilege - privilege requirement(should be below user's privilege) (optional)
 * token in header is required
 */
router.post("/create", async (ctx) => {
  const body = await ctx.request.body({ type: "json" }).value;

  let user = await token.checkHeader(ctx);

  if (user == false) {
    errorResponse(ctx, "Unauthorized", 401);
    return;
  }

  body.title = body.title || "title";
  // body.description = body.description || "description";
  body.privilege = +body.privilege || 0;

  body.userId = user.id;

  if (user.privilege! < body.privilege) await errorResponse(ctx, "Insufficient privilege", 403);
  else if (body.title.length > 64 || body.description.length > 256) errorResponse(ctx, "Required parameters too long", 400);
  else {
    await new Post().create(body);
    ctx.response.status = 201;
    ctx.response.body = "Success";
  }
});

/**
 * @api {post} / create a new Post
 * @field {string} id - id
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
  let post = new Post();

  post.where({ userId: user.id!.toString(), id: body.id });
  await post.first();
  if (!post.inited) errorResponse(ctx, "Not found", 404);
  else if (body.title.length > 64 || body.description.length > 256) errorResponse(ctx, "Required parameters too long", 400);
  else {
    let location = new bucket("Post", post.data!.id);
    if (body.content) {
      body.path = post.data!.id;
      location.writeString(body.content);
    }
    delete body.content;
    body.lastModified = getTime();
    await post.update(body);
    ctx.response.status = 202;
    ctx.response.body = "Success";
  }
});

/**
 * @api {delete} / delete a Post
 * @field {string} id - id
 * token in header is required
 */
router.delete("/:id", async (ctx) => {
  let user = await token.checkHeader(ctx);
  if (user == false) {
    errorResponse(ctx, "Unauthorized", 401);
    return;
  }
  let post = new Post();
  post.where({ userId: user.id!.toString(), id: ctx.params.id });
  await post.first();
  if (!post.inited) errorResponse(ctx, "Not found", 404);
  else {
    ctx.response.status = 202;
    ctx.response.body = "Success";
    await new bucket("Post", post.data!.id).delete();
    await post.delete();
  }
});

export default router;
