import promiseWrapper from './promise-wrapper';
import { splitKeysAndParams, createFilterQuery } from './query';
import { isObject } from './util';

export function find({ docClient, TableName, params, tableKeyDefinition }) {
  const [Key, scanParams] = splitKeysAndParams(params, tableKeyDefinition);

  // If we have any params that aren't `key` attributes in the table we
  // need to use `docClient.scan` instead of `docClient.get`
  if (isObject(scanParams) && Object.keys(scanParams).length > 0) {
    return promiseWrapper(docClient, 'scan', Object.assign({
      TableName,
    }, createFilterQuery(scanParams)))
      .then(handleFindResults);
  }

  return promiseWrapper(docClient, 'get', {
    TableName,
    Key,
  })
    .then(handleFindResults);
}

export function findOne({ docClient, TableName, params, tableKeyDefinition }) {
  return find({ docClient, TableName, params, tableKeyDefinition })
    .then(res => res && res[0] || null);
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
