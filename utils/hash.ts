// abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012345678
const dict = "Xyju4NsGxfrJC6knwgP1i0W7vTB2R3KHocOpadZYmQqFIVltUEDLSzMh8e5Ab";
//same salt, bc it's convienent
const salt = "4hs'\"\\87*8mnGTV?";

async function hash(value: string) {
  value += salt;
  const hashed = await crypto.subtle.digest(
    "sha-512",
    Int16Array.from(value.split("").map((x) => x.charCodeAt(0)))
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
