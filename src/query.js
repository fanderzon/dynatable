import { isObject } from './util';

export const keyPrefix = '#dt';
export const valuePrefix = ':dt';

// Splits an object of query params into 2 objects
// One for any params that matches the defined table keys
// and another object for all other params
// ({id: 1, name: 'pony', interests: 'ponying'}, { id: 'N' }) -> [{id: 1}, {name: 'pony', interests: 'ponying'}]
export function splitKeysAndParams(params, tableKeys) {
  params = isObject(params) ? params : {};
  tableKeys = isObject(tableKeys) ? tableKeys : {};

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

export function createFilterQuery(params = {}) {
  const paramKeys = Object.keys(params);
  if (!paramKeys || paramKeys.length === 0) {
    return {};
  }

  return {
    FilterExpression: paramKeys.reduce((acc, key) => {
      const maybeAnd = acc === '' ? '' : ' AND '
      return `${acc}${maybeAnd}${constructComparisonString(key, params[key])}`;
    }, ''),
    ExpressionAttributeNames: paramKeys.reduce((acc, key) => {
      return Object.assign(acc, {
        [`${keyPrefix}${key}`]: key,
      });
    }, {}),
    ExpressionAttributeValues: paramKeys.reduce((acc, key) => {
      return Object.assign(acc, constructAttributeValue(key, params[key]));
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
  const val = value[firstKey];
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
      return `(${keyPrefix}${key} IN ${constructInValueString(key, val)})`;
    case '$nin':
      return `(${keyPrefix}${key} NOT IN ${constructInValueString(key, val)})`;
    default:
      return equalityString;
  }

  function constructInValueString(key, value) {
    // Default valuestring for a single value
    let valueString = `(${valuePrefix}${key})`
    if (Array.isArray(value)) {
      // If array create multiple comma separated entries
      valueString = value.reduce((acc, curr, i) => {
        return `${acc}${i > 0 ? ', ' : ''}${valuePrefix}${key}${i}${i === (value.length - 1) ? ')' : ''}`;
      }, '(');
    }
    return valueString;
  }
}

export function constructAttributeValue(key, value) {
  // If value is a comparison object pick out the actual value from that
  if (isObject(value)) {
    const firstKey = Object.keys(value)[0];
    // If an IN or NOT IN object split out each value from the array
    if (firstKey === '$in' || firstKey === '$nin' && typeof value[firstKey] !== 'undefined') {
      return value[firstKey].reduce((acc, curr, index) => {
        acc[`${valuePrefix}${key}${index}`] = curr;
        return acc;
      }, {});
    } else if (firstKey && comparisonKeys.indexOf(firstKey) !== -1) {
      value = value[firstKey];
    }
  }

  return { [`${valuePrefix}${key}`]: value };
}

export function createUpdateQuery(params) {
  const paramKeys = Object.keys(params);

  return {
    ExpressionAttributeNames: constructAttributeNames(params),
    // Create a key/value mapper object that maps data from the params object
    // To prefixed keys you can use in the update expression
    ExpressionAttributeValues: paramKeys.reduce((acc, curr) => {
      return Object.assign(acc, constructAttributeValue(curr, params[curr]));
    }, {}),
    // Create an update expression based on params
    // Assuming that the keys are the same as the DynamoDB key
    UpdateExpression: paramKeys.reduce((acc, curr, i) => {
      return `${acc}${i === 0 ? 'SET ' : ', '}${constructUpdateString(curr)}`;
    }, ''),
  };
}

export function constructUpdateString(key) {
  return `${keyPrefix}${key} = ${valuePrefix}${key}`;
}

export function constructAttributeNames(params) {
  const paramKeys = Object.keys(params);

  return paramKeys.reduce((acc, curr) => {
    return Object.assign(acc, {
      [`${keyPrefix}${curr}`]: curr,
    }, {});
  }, {});
}
