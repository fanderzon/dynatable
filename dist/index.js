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

function tableWrapper(docClient, TableName) {
  return {
    get: function (params) { return promiseWrapper(docClient, 'get', {
      TableName: TableName,
      Key: params,
    }); },
    put: function (params) { return promiseWrapper(docClient, 'put', {
      TableName: TableName,
      Item: params,
    }); },
    update: function (Key, params) {
      // Make sure we have some input, since we will perform some magic here
      if (!Key || !params || Object.keys(Key).length < 1 || Object.keys(params).length < 1) {
        return Promise.reject((TableName + ".update: Key and params are required input"));
      }

      // Protection from trying to update the primary key
      if (params && params.id) {
        delete params.id;
      }

      var keys = Object.keys(params);
      var paramPrefix = ':lsp';

      // Create an update expression based on params
      // Assuming that the keys are the same as the DynamoDB key
      var UpdateExpression = keys.reduce(function (acc, curr) {
        return ("" + acc + (acc === 'set ' ? '' : ',') + " " + curr + " = " + paramPrefix + curr);
      }, 'set ');

      // Create a key/value mapper object that maps data from the params object
      // To prefixed keys you can use in the update expression
      var ExpressionAttributeValues = keys.reduce(function (acc, curr) {
        return Object.assign(acc, ( obj = {}, obj[("" + paramPrefix + curr)] = params[curr], obj ));
        var obj;
      }, {});

      return promiseWrapper(docClient, 'update', {
        TableName: TableName,
        Key: Key,
        ExpressionAttributeValues: ExpressionAttributeValues,
        UpdateExpression: UpdateExpression,
        ReturnValues: 'UPDATED_NEW',
      });
    },
    delete: function (Key) { return promiseWrapper(docClient, 'delete', {
      TableName: TableName,
      Key: Key,
    }); },
  };
}

module.exports = tableWrapper;
