import promiseWrapper from './promise-wrapper';
import { splitKeysAndParams } from './query';
import { isObject } from './util';
import { find, findOne } from './find';
import { update } from './update';

export default function tableWrapper(docClient, TableName, tableKeyDefinition) {
  const tableParams = { docClient, TableName, tableKeyDefinition };
  return {
    find: params => find(Object.assign({}, tableParams, { params })),
    findOne: params => findOne(Object.assign({}, tableParams, { params })),
    put: params => promiseWrapper(docClient, 'put', {
      TableName,
      Item: params,
      ReturnValues: 'ALL_NEW',
    }),
    update: (Key, params) => update(Object.assign({}, tableParams, { Key, params })),
    delete: Key => promiseWrapper(docClient, 'delete', {
      TableName,
      Key,
    }),
  };
}
