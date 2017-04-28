import promiseWrapper from './promise-wrapper';
import { createUpdateQuery } from './query';

export function update({ docClient, TableName, Key, params, tableKeyDefinition }) {
  // Make sure we have some input, since we will perform some magic here
  if (!Key || !params || Object.keys(Key).length < 1 || Object.keys(params).length < 1) {
    return Promise.reject(`${TableName}.update: Key and params are required input`);
  }

  const paramKeys = Object.keys(params);
  const safeParams = paramKeys.reduce((acc, curr) => {
    return Object.assign(acc, Object.keys(tableKeyDefinition).indexOf(curr) === -1 ?
    {[curr]: params[curr]} : {});
  }, {});

  return promiseWrapper(docClient, 'update', Object.assign({
    TableName,
    Key,
    ReturnValues: 'ALL_NEW',
  }, createUpdateQuery(safeParams)));
}
