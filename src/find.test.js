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
      get: jest.fn((params, cb) => cb('Something went wrong')),
    };
    find({ docClient, TableName, tableKeyDefinition, params })
      .catch(err => expect(err).toBeDefined());
  });

  it('Should call `get` for table keys and `scan` for other keys', () => {
    docClient = {
      get: jest.fn(),
      scan: jest.fn(),
    };
    find({ docClient, TableName, tableKeyDefinition, params: { id: 5 } });
    expect(docClient.get.mock.calls.length).toBe(1);
    find({ docClient, TableName, tableKeyDefinition, params: { blorg: 5 } });
    expect(docClient.scan.mock.calls.length).toBe(1);
  });
});
