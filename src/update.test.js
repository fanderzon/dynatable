import { update } from './update';
import { keyPrefix } from './query';

let docClient;
let Key = { id: 1 };
let invalidKey = null;
let TableName = 'w00t';
let tableKeyDefinition = { id: 'N', name: 'S' };
let params = { name: 'Porky' };

describe('find', () => {
  it('Should reject when docClient is invalid', () => {
    docClient = null;
    update({ docClient, Key, TableName, tableKeyDefinition, params })
      .catch(err => expect(err).toBeDefined());
    docClient = {};
    update({ docClient, Key, TableName, tableKeyDefinition, params })
      .catch(err => expect(err).toBeDefined());
  });

  it('Should reject on callback errors', () => {
    docClient = {
      update: jest.fn((params, cb) => cb('Something went wrong')),
    };
    update({ docClient, Key, TableName, tableKeyDefinition, params })
      .catch(err => expect(err).toBeDefined());
  });

  it('Should reject on invalid input', () => {
    docClient = {
      update: jest.fn((params, cb) => cb(null, Key)),
    };
    update({ docClient, Key: invalidKey, TableName, tableKeyDefinition, params })
      .catch(err => expect(err).toBeDefined());
  });

  it('Should call docClient.update on valid input', () => {
    docClient = {
      update: jest.fn((params, cb) => cb(null, {id: 1, name: 'Porky'})),
    };
    update({ docClient, Key, TableName, tableKeyDefinition, params })
      .then(res => expect(res).toEqual({id: 1, name: 'Porky'}));

    expect(docClient.update.mock.calls.length).toBe(1);
  });

  it('Should strip out partition keys from update', () => {
    docClient = {
      update: jest.fn((params, cb) => cb(null, {id: 1, name: 'Porky'})),
    };
    update({ docClient, Key, TableName, tableKeyDefinition, params: {id: 1, spork: 'Dork'} })
      .then(res => expect(res).toEqual({id: 1, name: 'Porky'}));

    expect(docClient.update.mock.calls.length).toBe(1);
    expect(docClient.update.mock.calls[0][0]['ExpressionAttributeNames']).toEqual({
      [`${keyPrefix}spork`]: 'spork'
    });
  });
});
