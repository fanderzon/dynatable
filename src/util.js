export function isFunction(input) {
 return typeof input === 'function';
}

export function isObject(input) {
  return !isFunction(input) && !Array.isArray(input) && input === Object(input);
}
