const timeOffset = new Date().getTimezoneOffset() * 60 * 1000;
function getTime() {
  return Date.now() + timeOffset;
}

export default getTime;
