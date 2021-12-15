import { Model, Router } from "../deps.ts";

import getTime from "../utils/time.ts";
import Book from "../models/Book.ts";
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
 * @api {get} /title/:title get book info by title
 * token in header is required
 */
router.get("/title/:title", async (ctx) => {
  let user = await token.checkHeader(ctx);
  if (!user) {
    await errorResponse(ctx, "Unauthorized", 401);
    return;
  }
  let book = new Book();
  book.where("title", ctx.params.title);
  await book.first();
  if (book.found) {
    ctx.response.body = book.getSanitzedValue();
  } else await errorResponse(ctx, "Not found", 404);
});

/**
 * @api {get} /id/:id get book info by id
 * token in header is required
 */
router.get("/id/:id", async (ctx) => {
  let user = await token.checkHeader(ctx);
  if (!user) {
    await errorResponse(ctx, "Unauthorized", 401);
    return;
  }
  let book = new Book();
  book.where("id", ctx.params.id);
  await book.first();
  if (book.found) {
    ctx.response.body = book.getSanitzedValue();
  } else await errorResponse(ctx, "Not found", 404);
});

/**
 * @api {get} /list/:id read post content info by id
 * token in header is required
 */
router.get("/list/:id", async (ctx) => {
  let user = await token.checkHeader(ctx);
  if (!user) {
    await errorResponse(ctx, "Unauthorized", 401);
    return;
  }

  let book = new Book();
  book.where("id", ctx.params.id);
  await book.first();
  if (ctx.params.id == "0") await errorResponse(ctx, "System reserved", 409);
  else if (book.found) {
    let posts = new Post();
    posts.where("bookId", ctx.params.id);
    posts.limit(300);
    await posts.all();
    ctx.response.body = { content: posts.getSanitzedValue() };
  } else await errorResponse(ctx, "Not found", 404);
});

/**
 * @api {get} /query/description/:description search book info by description
 * @field offset offset
 * token in header is required
 */
router.get("/latest/:offset", async (ctx) => {
  let user = await token.checkHeader(ctx);
  if (!user) {
    await errorResponse(ctx, "Unauthorized", 401);
    return;
  }
  let books = new Book();
  books.where("privilege", "<=", "" + user.privilege);
  books.orderBy("lastModified", "asc");
  books.limit(10);
  books.offset(+ctx.params.offset);
  await books.all();
  ctx.response.body = { query: books.data || [] };
});

/**
 * @api {book} /create create a new Book
 * @field {string} title - title
 * @field {string} description - description (optional)
 * @field {number} privilege - privilege requirement(should be below user's privilege) (optional)
 * token in header is required
 */
router.post("/create", async (ctx) => {
  const body = await ctx.request.body({ type: "json" }).value;

  let user = await token.checkHeader(ctx);

  if (user == false) {
    await errorResponse(ctx, "Unauthorized", 401);
    return;
  }

  body.title = body.title || "title";
  body.description = body.description || "description";
  body.privilege = +body.privilege || 0;

  body.userId = user.id;

  if (user.privilege! < body.privilege) await errorResponse(ctx, "Insufficient privilege", 403);
  else if (body.title.length > 64 || body.description.length > 256) await errorResponse(ctx, "Required parameters too long", 400);
  else {
    await new Book().create(body);
    ctx.response.status = 201;
    ctx.response.body = "Success";
  }
});

/**
 * @api {put} / create a new Book
 * @field {string} id - id
 * @field {string} title - title
 * @field {string} description - description (optional)
 * @field {number} privilege - privilege requirement(should be below user's privilege) (optional)
 * @field {string} content - a very long string
 * token in header is required
 */
router.put("/", async (ctx) => {
  const body = await ctx.request.body({ type: "json" }).value;
  let user = await token.checkHeader(ctx);
  if (user == false) {
    await errorResponse(ctx, "Unauthorized", 401);
    return;
  }
  let book = new Book();

  book.where({ userId: user.id!.toString(), id: body.id });
  await book.first();
  if (!book.found) await errorResponse(ctx, "Not found", 404);
  else if (body.title.length > 64 || body.description.length > 256) await errorResponse(ctx, "Required parameters too long", 400);
  else {
    body.lastModified = getTime();
    await book.update(body);
    ctx.response.status = 202;
    ctx.response.body = "Success";
  }
});

/**
 * @api {put} /link/ link a post to a book
 * @field {string} bookId - id
 * @field {string} postId - id
 * token in header is required
 */
router.put("/link", async (ctx) => {
  const body = await ctx.request.body({ type: "json" }).value;
  let user = await token.checkHeader(ctx);
  if (user == false) {
    await errorResponse(ctx, "Unauthorized", 401);
    return;
  }

  let book = new Book();
  book.where({ userId: user.id!.toString(), id: body.bookId });
  let post = new Post();
  post.where({ userId: user.id!.toString(), id: body.bookId });
  await Promise.all([book.first(), post.first()]);
  if (!book.found || !post.found) await errorResponse(ctx, "Not found", 404);
  else {
    ctx.response.status = 202;
    ctx.response.body = "Success";
    post.update({ bookId: body.bookId, lastModified: getTime().toString() });
    book.update({ lastModified: getTime().toString() });
  }
});

/**
 * @api {delete} / delete a Book
 * @field {string} id - id
 * token in header is required
 */
router.delete("/:id", async (ctx) => {
  let user = await token.checkHeader(ctx);
  if (user == false) {
    await errorResponse(ctx, "Unauthorized", 401);
    return;
  }
  let book = new Book();
  book.where({ userId: user.id!.toString(), id: ctx.params.id });
  await book.first();
  if (!book.found) await errorResponse(ctx, "Not found", 404);
  else {
    ctx.response.status = 202;
    ctx.response.body = "Success";
    await book.delete();
  }
});

export default router;
