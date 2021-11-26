const maxTokenCap = 1000;
if (!tokenStorage!) var tokenStorage = new Map();
function generateToken(user: any, time = 3600000): string {
  if (tokenStorage.size >= maxTokenCap)
    throw new Error("Token storage is full");
  const token =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  // use "crypto.getRandomValues", which is more secured.
  tokenStorage.set(token, user);
  // "setTimeout" isn't a good choice, because it will be called very often.
  setTimeout(() => {
    deleteToken(token);
  }, time);
  return token;
}

function verifyToken(token: string) {
  if (!tokenStorage.has(token)) return -1;
  return tokenStorage.get(token);
}

function deleteToken(token: string) {
  if (!tokenStorage.has(token)) return false;
  tokenStorage.delete(token);
  return true;
}

export default {
  generate: generateToken,
  verify: verifyToken,
  delete: deleteToken,
};
