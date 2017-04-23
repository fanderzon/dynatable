import promiseWrapper from './promise-wrapper';

export function update({ docClient, TableName, Key, params, tableKeyDefinition }) {
  // Make sure we have some input, since we will perform some magic here
  if (!Key || !params || Object.keys(Key).length < 1 || Object.keys(params).length < 1) {
    return Promise.reject(`${TableName}.update: Key and params are required input`);
  }

  // Protection from trying to update the primary key
  if (params && params.id) {
    delete params.id;
  }

  const keys = Object.keys(params);
  const paramPrefix = ':lsp';

  // Create an update expression based on params
  // Assuming that the keys are the same as the DynamoDB key
  const UpdateExpression = keys.reduce((acc, curr) => {
    return `${acc}${acc === 'set ' ? '' : ','} ${curr} = ${paramPrefix}${curr}`;
  }, 'set ');

  // Create a key/value mapper object that maps data from the params object
  // To prefixed keys you can use in the update expression
  const ExpressionAttributeValues = keys.reduce((acc, curr) => {
    return Object.assign(acc, {
      [`${paramPrefix}${curr}`]: params[curr]
    });
  }, {});

  return promiseWrapper(docClient, 'update', {
    TableName,
    Key,
    ExpressionAttributeValues,
    UpdateExpression,
    ReturnValues: 'ALL_NEW',
  });
}
