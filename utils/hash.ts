import { config } from "../deps.ts";
const dict = config().HASH_TABLE;
//same salt, bc it's convienent
const salt = "4hs'\"\\87*8mnGTV?";

/**
 * hash an string by salted sha512
 * @param value
 * @returns {Promise<string>} hashed sting wiht length 64
 */
async function hash(value: string) {
  value += salt;
  const hashed = await crypto.subtle.digest(
    "sha-512",
    Int16Array.from(value.split("").map((x) => x.charCodeAt(0))),
  );
  let result = "";
  new Uint8Array(hashed).forEach((x) => {
    result += parseChar(x);
  });
  return result;
}

function parseChar(val: number) {
  return dict[val % dict.length];
}

export default hash;
