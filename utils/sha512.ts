async function sha512(value: string) {
  const hashed = await crypto.subtle.digest(
    "sha-512",
    Int16Array.from(value.split("").map((x) => x.charCodeAt(0)))
  );
  let result = "";
  new Uint16Array(hashed).forEach((x) => {
    result += parseChar(x);
  });
  return result;
}

function parseChar(val: number) {
  const dict = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012345678";
  return dict[val % dict.length];
}

export default sha512;
