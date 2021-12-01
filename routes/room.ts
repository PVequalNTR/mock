import { Router } from "../deps.ts";

import Room from "../models/Room.ts";
import User from "../models/User.ts";
import hash from "../utils/hash.ts";
import token from "../utils/token.ts";
import RoomUser from "../models/RoomUser.ts";

const router = new Router();

/**
 * @api {post} /user/join join room
 * @field {string} name - User name
 * @field {string} token - User token
 * @field {number} code - Room invite code
 */
router.post("/room/join", async (ctx) => {
  const body = await ctx.request.body({ type: "json" }).value;
});

/**
 * @api {post} /user/join create room
 * @field {string} name - User name
 * @field {string} token - User token
 * @field {string} room - Room name
 */
router.post("/room/create", async (ctx) => {
  const body = await ctx.request.body({ type: "json" }).value;
  // check if required parameters were provided
  if (!body.name || !body.token || !body.room) {
    body.message = { message: "Required parameters not provided" };
    return;
  }
  // find users by token
  let user = await token.verify(body.token);
  if (user === false) {
    body.message = { message: "Invalid token" };
    return;
  }
  // create room
  const room = await Room.create({
    name: body.room,
    members: JSON.stringify([user.id]),
  });
  // join owner to the room
  let dbUser = await User.where("id", user.id).first();
  await RoomUser.create({ roomId: room.id, userId: dbUser.id });
  body.message = { message: "success" };
});

/**
 * @api {post} /user/join exit room
 * @field {string} name - User name
 * @field {string} token - User token
 * @field {string} room - Room name
 */
router.post("/room/exit", async (ctx) => {
  const body = await ctx.request.body({ type: "json" }).value;
});

/**
 * @api {post} /user/list list user's joined room
 * @field {string} name - User name
 * @field {string} token - User token
 */
router.post("/room/list", async (ctx) => {
  const body = await ctx.request.body({ type: "json" }).value;
  // check if required parameters were provided
  if (!body.name || !body.token || !body.room) {
    body.message = { message: "Required parameters not provided" };
    return;
  }
  // find users by token
  let user = await token.verify(body.token);
  if (user === false) {
    body.message = { message: "Invalid token" };
    return;
  }
  // create room
  const room = await Room.create({
    name: body.room,
    members: JSON.stringify([user.id]),
  });
});

export default router;
