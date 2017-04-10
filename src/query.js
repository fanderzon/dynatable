import { isObject } from './util';

export const keyPrefix = '#dt';
export const valuePrefix = ':dt';

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

const comparisonKeys = [
  '$eq', // Matches values that are equal to a specified value. (default)
  '$gt', // Matches values that are greater than a specified value.
  '$gte', // Matches values that are greater than or equal to a specified value.
  '$lt', // Matches values that are less than a specified value.
  '$lte', // Matches values that are less than or equal to a specified value.
  '$ne', // Matches all values that are not equal to a specified value.
  '$in', // Matches any of the values specified in an array.
  '$nin', // Matches none of the values specified in an array.
];
export function constructComparisonString(key, value) {
  // If value is not an object we can return the default (equality comparison)
  const equalityString = `(${keyPrefix}${key} = ${valuePrefix}${key})`;
  if (!isObject(value)) {
    return equalityString;
  }

  const firstKey = Object.keys(value)[0];
  switch (firstKey) {
    case '$gt':
      return `(${keyPrefix}${key} > ${valuePrefix}${key})`;
    case '$gte':
      return `(${keyPrefix}${key} >= ${valuePrefix}${key})`;
    case '$lt':
      return `(${keyPrefix}${key} < ${valuePrefix}${key})`;
    case '$lte':
      return `(${keyPrefix}${key} <= ${valuePrefix}${key})`;
    case '$ne':
      return `(${keyPrefix}${key} <> ${valuePrefix}${key})`;
    case '$in':
      return `(${keyPrefix}${key} IN ${valuePrefix}${key})`;
    case '$nin':
      return `(${keyPrefix}${key} NOT IN ${valuePrefix}${key})`;
    default:
      return equalityString;
  }
}
