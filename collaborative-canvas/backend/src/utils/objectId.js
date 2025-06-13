const objectIdRegex = /^[\da-f]{24}$/i;

export function isValidObjectId(maybeId) {
  return objectIdRegex.test(maybeId);
}