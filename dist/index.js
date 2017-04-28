'use strict';

// Calls `method` on the `api` provided, with the params provided
// Returns a Promise
function promiseWrapper(api, method, params) {
  return new Promise(function (resolve, reject) {
    try {
      api[method](params, function (err, data) {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    } catch (err) {
      return reject(err)
    }
  });
}

function isFunction(input) {
 return typeof input === 'function';
}

function isObject(input) {
  return !isFunction(input) && !Array.isArray(input) && input === Object(input);
}

var keyPrefix = '#dt';
var valuePrefix = ':dt';

// Splits an object of query params into 2 objects
// One for any params that matches the defined table keys
// and another object for all other params
// ({id: 1, name: 'pony', interests: 'ponying'}, { id: 'N' }) -> [{id: 1}, {name: 'pony', interests: 'ponying'}]
function splitKeysAndParams(params, tableKeys) {
  if (!isObject(params) || !isObject(tableKeys)) {
    return null;
  }

  var keys = Object.keys(tableKeys);
  var paramKeys = Object.keys(params);
  return [
    paramKeys.reduce(function (acc, curr) { return Object.assign(acc,
      keys.includes(curr) && ( obj = {}, obj[curr] = params[curr], obj )
    )
      var obj; }, {}),
    paramKeys.reduce(function (acc, curr) { return Object.assign(acc,
      !keys.includes(curr) && ( obj = {}, obj[curr] = params[curr], obj )
    )
      var obj; }, {})
  ];
}

function createFilterQuery(params) {
  var paramKeys = Object.keys(params);
  return {
    FilterExpression: paramKeys.reduce(function (acc, key) {
      var maybeAnd = acc === '' ? '' : ' AND ';
      return ("" + acc + maybeAnd + (constructComparisonString(key, params[key])));
    }, ''),
    ExpressionAttributeNames: paramKeys.reduce(function (acc, key) {
      return Object.assign(acc, ( obj = {}, obj[("" + keyPrefix + key)] = key, obj ));
      var obj;
    }, {}),
    ExpressionAttributeValues: paramKeys.reduce(function (acc, key) {
      return Object.assign(acc, constructAttributeValue(key, params[key]));
    }, {}),
  };
}

var comparisonKeys = [
  '$eq', // Matches values that are equal to a specified value. (default)
  '$gt', // Matches values that are greater than a specified value.
  '$gte', // Matches values that are greater than or equal to a specified value.
  '$lt', // Matches values that are less than a specified value.
  '$lte', // Matches values that are less than or equal to a specified value.
  '$ne', // Matches all values that are not equal to a specified value.
  '$in', // Matches any of the values specified in an array.
  '$nin' ];
function constructComparisonString(key, value) {
  // If value is not an object we can return the default (equality comparison)
  var equalityString = "(" + keyPrefix + key + " = " + valuePrefix + key + ")";
  if (!isObject(value)) {
    return equalityString;
  }

  var firstKey = Object.keys(value)[0];
  var val = value[firstKey];
  switch (firstKey) {
    case '$gt':
      return ("(" + keyPrefix + key + " > " + valuePrefix + key + ")");
    case '$gte':
      return ("(" + keyPrefix + key + " >= " + valuePrefix + key + ")");
    case '$lt':
      return ("(" + keyPrefix + key + " < " + valuePrefix + key + ")");
    case '$lte':
      return ("(" + keyPrefix + key + " <= " + valuePrefix + key + ")");
    case '$ne':
      return ("(" + keyPrefix + key + " <> " + valuePrefix + key + ")");
    case '$in':
      return ("(" + keyPrefix + key + " IN " + (constructInValueString(key, val)) + ")");
    case '$nin':
      return ("(" + keyPrefix + key + " NOT IN " + (constructInValueString(key, val)) + ")");
    default:
      return equalityString;
  }

  function constructInValueString(key, value) {
    // Default valuestring for a single value
    var valueString = "(" + valuePrefix + key + ")";
    if (Array.isArray(value)) {
      // If array create multiple comma separated entries
      valueString = value.reduce(function (acc, curr, i) {
        return ("" + acc + (i > 0 ? ', ' : '') + valuePrefix + key + i + (i === (value.length - 1) ? ')' : ''));
      }, '(');
    }
    return valueString;
  }
}

function constructAttributeValue(key, value) {
  // If value is a comparison object pick out the actual value from that
  if (isObject(value)) {
    var firstKey = Object.keys(value)[0];
    // If an IN or NOT IN object split out each value from the array
    if (firstKey === '$in' || firstKey === '$nin' && typeof value[firstKey] !== 'undefined') {
      return value[firstKey].reduce(function (acc, curr, index) {
        acc[("" + valuePrefix + key + index)] = curr;
        return acc;
      }, {});
    } else if (firstKey && comparisonKeys.indexOf(firstKey) !== -1) {
      value = value[firstKey];
    }
  }

  return ( obj = {}, obj[("" + valuePrefix + key)] = value, obj );
  var obj;
}

function createUpdateQuery(params) {
  var paramKeys = Object.keys(params);

  return {
    ExpressionAttributeNames: constructAttributeNames(params),
    // Create a key/value mapper object that maps data from the params object
    // To prefixed keys you can use in the update expression
    ExpressionAttributeValues: paramKeys.reduce(function (acc, curr) {
      return Object.assign(acc, constructAttributeValue(curr, params[curr]));
    }, {}),
    // Create an update expression based on params
    // Assuming that the keys are the same as the DynamoDB key
    UpdateExpression: paramKeys.reduce(function (acc, curr, i) {
      return ("" + acc + (i === 0 ? 'SET ' : ', ') + (constructUpdateString(curr)));
    }, ''),
  };
}

function constructUpdateString(key) {
  return ("" + keyPrefix + key + " = " + valuePrefix + key);
}

function constructAttributeNames(params) {
  var paramKeys = Object.keys(params);

  return paramKeys.reduce(function (acc, curr) {
    return Object.assign(acc, ( obj = {}, obj[("" + keyPrefix + curr)] = curr, obj ), {});
    var obj;
  }, {});
}

function find(ref) {
  var docClient = ref.docClient;
  var TableName = ref.TableName;
  var params = ref.params;
  var tableKeyDefinition = ref.tableKeyDefinition;

  var ref$1 = splitKeysAndParams(params, tableKeyDefinition);
  var Key = ref$1[0];
  var scanParams = ref$1[1];

  // If we have any params that aren't `key` attributes in the table we
  // need to use `docClient.scan` instead of `docClient.get`
  if (isObject(scanParams) && Object.keys(scanParams).length > 0) {
    return promiseWrapper(docClient, 'scan', Object.assign({
      TableName: TableName,
    }, createFilterQuery(scanParams)))
      .then(handleFindResults);
  }

  return promiseWrapper(docClient, 'get', {
    TableName: TableName,
    Key: Key,
  })
    .then(handleFindResults);
}

function findOne(ref) {
  var docClient = ref.docClient;
  var TableName = ref.TableName;
  var params = ref.params;
  var tableKeyDefinition = ref.tableKeyDefinition;

  return find({ docClient: docClient, TableName: TableName, params: params, tableKeyDefinition: tableKeyDefinition })
    .then(function (res) { return res && res[0] || null; });
}

function handleFindResults(res) {
  // Ensure that the response has either of the data properties, otherwise return an empty array
  if (!res.Items && !res.Item) {
    return [];
  }

  // Ensure that `.find()` always returns an array
  // `.get()` will return an Item prop with a single object
  // `.scan()` will return an Items prop with one or more objects
  return res.Items ? res.Items : [ res.Item ];
}

function update(ref) {
  var docClient = ref.docClient;
  var TableName = ref.TableName;
  var Key = ref.Key;
  var params = ref.params;
  var tableKeyDefinition = ref.tableKeyDefinition;

  // Make sure we have some input, since we will perform some magic here
  if (!Key || !params || Object.keys(Key).length < 1 || Object.keys(params).length < 1) {
    return Promise.reject((TableName + ".update: Key and params are required input"));
  }

  var paramKeys = Object.keys(params);
  var safeParams = paramKeys.reduce(function (acc, curr) {
    return Object.assign(acc, Object.keys(tableKeyDefinition).indexOf(curr) === -1 ?
    ( obj = {}, obj[curr] = params[curr], obj ) : {});
    var obj;
  }, {});

  return promiseWrapper(docClient, 'update', Object.assign({
    TableName: TableName,
    Key: Key,
    ReturnValues: 'ALL_NEW',
  }, createUpdateQuery(safeParams)));
}

function tableWrapper(docClient, TableName, tableKeyDefinition) {
  var tableParams = { docClient: docClient, TableName: TableName, tableKeyDefinition: tableKeyDefinition };
  return {
    find: function (params) { return find(Object.assign({}, tableParams, { params: params })); },
    findOne: function (params) { return findOne(Object.assign({}, tableParams, { params: params })); },
    put: function (params) { return promiseWrapper(docClient, 'put', {
      TableName: TableName,
      Item: params,
    }); },
    update: function (Key, params) { return update(Object.assign({}, tableParams, { Key: Key, params: params })); },
    delete: function (Key) { return promiseWrapper(docClient, 'delete', {
      TableName: TableName,
      Key: Key,
    }); },
  };
}

module.exports = tableWrapper;
