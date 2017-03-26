import promiseWrapper from './promise-wrapper';
import { splitKeysAndParams, createFilterQuery } from './query';
import { isObject } from './util';

export default function find({ docClient, TableName, params, tableKeyDefinition }) {
  console.log('find', TableName, tableKeyDefinition);
  const [Key, scanParams] = splitKeysAndParams(params, tableKeyDefinition);

  // If we have any params that aren't `key` attributes in the table we
  // need to use `docClient.scan` instead of `docClient.get`
  if (isObject(scanParams) && Object.keys(scanParams).length > 0) {
    return promiseWrapper(docClient, 'scan', Object.assign({
      TableName,
    }, createFilterQuery(scanParams)));
  }

  return promiseWrapper(docClient, 'get', {
    TableName,
    Key,
  });
}
