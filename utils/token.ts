import { LRU } from "https://deno.land/x/lru@1.0.2/mod.ts";
import { Model } from "../deps.ts";
import Token from "../db/models/Token.ts";
import User from "../db/models/User.ts";
import { config } from "../deps.ts";
import getTime from "./time.ts";

// todo: LRU
declare global {
  var tokenS: { tokenCache: LRU<string>; timer: number };
}

const default_TOKEN_TTL = +(config().TOKEN_TTL || 7200000);
const token_recycle_time = 10 * 1000;

var tokenS;

if (!tokenS)
  tokenS = {
    tokenCache: new LRU(50),
    timer: setInterval(recycleToken, token_recycle_time),
  };

/**
 * recycle token (private)
 * @returns {Promise<void>}
 */
async function recycleToken() {
  let expiredToken = await Token.where("expire", "<", "" + getTime()).all();
  return await Promise.all(expiredToken.map((x) => x.delete()));
}

/**
 * generateToken by user id
 * @param {number} userId_
 * @param {number} time time to live in milliseconds
 * @returns {Promise<string>} token(value)
 */
async function generateToken(userId_: number, time = default_TOKEN_TTL) {
  // use "crypto.getRandomValues", which is more secured.
  const dict = config().HASH_TABLE;
  var randomSeed = new Uint8Array(64);
  await crypto.getRandomValues(randomSeed);
  let token_g = "";
  randomSeed.forEach((v) => (token_g += dict[v % dict.length]));
  await Token.create({
    value: token_g,
    userId: userId_,
    ttl: time,
    expire: getTime() + time,
  });
  return token_g;
}

/**
 * verify token from database (private)
 * @param {string} token token to be verified
 * @returns {Promise<boolean|User>} false if fail, user if success
 */
async function verifyToken(token: string) {
  let token_db = await Token.where("value", token).first();
  if (!token_db) return false;
  if (+token_db.expire! < getTime()) return false;
  return await Token.where("id", token_db.id as number).user();
}

/**
 * delete token from database
 * @param {string} token token(value) to be deleted
 * @returns {Promise<boolean>} true if success
 */
async function deleteToken(token: string) {
  if (!(await verifyToken(token))) {
    return false;
  }
  await Token.where("value", token).delete();
  return true;
}

/**
 * find token's owner(usually a user) by token
 * @param {RouterContext} ctx oak context
 * @returns {User} user in database
 */
async function checkHeader(ctx: any): Promise<Model | false> {
  const token_local = ctx.request.headers.get("authentication");
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
