import { find, findOne } from './find';

let docClient;
let TableName = 'w00t';
let tableKeyDefinition = { id: 'N' };
let params = { id: 1 };

describe('find', () => {
  it('Should reject when docClient is invalid', () => {
    docClient = null;
    find({ docClient, TableName, tableKeyDefinition, params })
      .catch(err => expect(err).toBeDefined());
    docClient = {};
    find({ docClient, TableName, tableKeyDefinition, params })
      .catch(err => expect(err).toBeDefined());
  });

  it('Should reject on callback errors', () => {
    docClient = {
      get: jest.fn((params, cb) => cb('Something went wrong'))
    };
    find({ docClient, TableName, tableKeyDefinition, params })
      .catch(err => expect(err).toBeDefined());
  });
});
