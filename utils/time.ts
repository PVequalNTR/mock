const timeOffset = new Date().getTimezoneOffset() * 60 * 1000;

/**
 * get low resolution time (UTC+0)
 * @returns {number} time in milliseconds
 */
function getTime(): number {
  return Date.now() + timeOffset;
}

export default getTime;
