export function isValidJoinCode(code) {
  return typeof code === 'string' && /^[A-Za-z0-9_-]{3,20}$/.test(code);
}