import { LRU } from "https://deno.land/x/lru@1.0.2/mod.ts";
import { Model } from "../deps.ts";
import Token from "../models/Token.ts";
import User from "../models/User.ts";
import { config } from "../deps.ts";

// todo: LRU
declare global {
  var tokenS: { tokenCache: LRU<string>; timer: number };
}

const default_TOKEN_TTL = +(config().TOKEN_TTL || 7200000);
const token_recycle_time = 60 * 1000;

function getCTime() {
  return Date.now() + new Date().getTimezoneOffset() * 60 * 1000;
}

var tokenS;

if (!tokenS)
  tokenS = {
    tokenCache: new LRU(50),
    timer: setInterval(recycleToken, token_recycle_time),
  };

async function recycleToken() {
  return await Promise.all(
    (
      await Token.where(
        "createdAt",
        ">",
        "" + (getCTime() + default_TOKEN_TTL)
      ).all()
    ).map((x) => x.delete())
  );
}

async function generateToken(userId_: number, time = default_TOKEN_TTL) {
  // use "crypto.getRandomValues", which is more secured.
  const dict = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012345678";
  var randomSeed = new Uint8Array(64);
  await crypto.getRandomValues(randomSeed);
  let token_g = "";
  randomSeed.forEach((v) => (token_g += dict[v % dict.length]));
  await Token.create({ value: token_g, userId: userId_, ttl: time });
  return token_g;
}

async function verifyToken(token: string) {
  let token_db = await Token.where("value", token).first();
  if (!token_db) return false;
  if (
    new Date("" + token_db.updatedAt).getTime() >
    +("" + token_db.ttl) + getCTime()
  )
    return false;
  return await Token.where("id", token_db.id as number).user();
}

async function deleteToken(token: string) {
  if (!(await verifyToken(token))) {
    return false;
  }
  await Token.where("value", token).delete();
  return true;
}

async function checkHeader(ctx: any): Promise<Model | false> {
  const token_local = ctx.request.headers.get("token");
  if (!token_local) {
    ctx.response.status = 401;
    ctx.response.body = "Unauthorized";
    return false;
  } else {
    let user = await verifyToken(token_local);
    if (!user) {
      ctx.response.status = 401;
      ctx.response.body = "Unauthorized";
      return false;
    } else return user;
  }
}

export default {
  generate: generateToken,
  verify: verifyToken,
  delete: deleteToken,
  checkHeader,
};
