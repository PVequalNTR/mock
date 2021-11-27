import Token from "../models/Token.ts";
import User from "../models/User.ts";

async function generateToken(userId_: number, time = 3600000) {
  // use "crypto.getRandomValues", which is more secured.
  const token_g =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  // await Token.create({ value: token_g, ttl: time });
  await Token.create({ value: token_g, userId: userId_, ttl: time });
  return token_g;
}

async function verifyToken(token: string) {
  let token_db = await Token.where("value", token).first();
  if (!token_db) return false;
  if (
    new Date("" + token_db.updatedAt).getTime() >
    Date.now() + +("" + token_db.ttl)
  )
    return false;
  return await Token.where("id", token_db.id as number).user();
}

async function getUser(token: string) {
  let token_db = await Token.where("value", token).first();
  if (!token_db) return false;
  if (
    new Date("" + token_db.updatedAt).getTime() >
    Date.now() + +("" + token_db.ttl)
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

export default {
  generate: generateToken,
  verify: verifyToken,
  delete: deleteToken,
};
