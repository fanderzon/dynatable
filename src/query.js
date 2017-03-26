import { isObject } from './util';

const keyPrefix = '#dt';
const valuePrefix = ':dt';

// Splits an object of query params into 2 objects
// One for any params that matches the defined table keys
// and another object for all other params
// ({id: 1, name: 'pony', interests: 'ponying'}, { id: 'N' }) -> [{id: 1}, {name: 'pony', interests: 'ponying'}]
export function splitKeysAndParams(params, tableKeys) {
  if (!isObject(params) || !isObject(tableKeys)) {
    return null;
  }

  const keys = Object.keys(tableKeys);
  const paramKeys = Object.keys(params);
  return [
    paramKeys.reduce((acc, curr) => Object.assign(acc,
      keys.includes(curr) && { [curr]: params[curr] }
    ), {}),
    paramKeys.reduce((acc, curr) => Object.assign(acc,
      !keys.includes(curr) && { [curr]: params[curr] }
    ), {})
  ];
}

export function createFilterQuery(params) {
  const paramKeys = Object.keys(params);
  return {
    FilterExpression: paramKeys.reduce((acc, key) => {
      const maybeAnd = acc === '' ? '' : ' AND '
      return `${acc}${maybeAnd}(${keyPrefix}${key} = ${valuePrefix}${key})`;
    }, ''),
    ExpressionAttributeNames: paramKeys.reduce((acc, key) => {
      return Object.assign(acc, {
        [`${keyPrefix}${key}`]: key,
      });
    }, {}),
    ExpressionAttributeValues: paramKeys.reduce((acc, key) => {
      const val = params[key];
      return Object.assign(acc, {
        [`${valuePrefix}${key}`]: val,
      });
    }, {}),
  };
}
