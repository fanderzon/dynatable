import { find, findOne } from './find';

let docClient;
let TableName = 'w00t';
let tableKeyDefinition = { id: 'N', name: 'S' };
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
    find({ docClient, TableName, tableKeyDefinition, params: { id: 5, name: 'Pony' } });
    expect(docClient.get.mock.calls.length).toBe(2);
    find({ docClient, TableName, tableKeyDefinition, params: { id: 5, name: 'Pony', isPink: true } });
    expect(docClient.scan.mock.calls.length).toBe(2);
  });

  it('Should return an array if resolved', () => {
    docClient = {
      get: jest.fn((params, cb) => cb(null, {
        Item: { id: 1 }
      })),
      scan: jest.fn((params, cb) => cb(null, {
        Items: [ { id: 1 }, { id: 2 } ]
      })),
    };

    find({ docClient, TableName, tableKeyDefinition, params: { id: 5 } })
      .then(res => expect(Array.isArray(res) && res.length === 1).toBeTruthy());
    find({ docClient, TableName, tableKeyDefinition, params: { id: 5, isPirple: 'huh?' } })
      .then(res => expect(Array.isArray(res) && res.length === 2).toBeTruthy());
  });

  it('Should return an empty array when resolved without Item or Items keys', () => {
    docClient = {
      get: jest.fn((params, cb) => cb(null, { id: 1 })),
      scan: jest.fn((params, cb) => cb(null,
        [ { id: 1 }, { id: 2 } ]
      )),
    };

    find({ docClient, TableName, tableKeyDefinition, params: { id: 5 } })
      .then(res => expect(Array.isArray(res) && res.length === 0).toBeTruthy());
    find({ docClient, TableName, tableKeyDefinition, params: { id: 5, isPirple: 'huh?' } })
      .then(res => expect(Array.isArray(res) && res.length === 0).toBeTruthy());
  });
});

describe('findOne', () => {
  it('Should return the first item', () => {
    docClient = {
      get: jest.fn((params, cb) => cb(null, {
        Item: { id: 1 }
      })),
      scan: jest.fn((params, cb) => cb(null, {
        Items: [ { id: 1 }, { id: 2 } ]
      })),
    };

    findOne({ docClient, TableName, tableKeyDefinition, params: { id: 1 } })
      .then(res => expect(res).toEqual({ id: 1 }));
    findOne({ docClient, TableName, tableKeyDefinition, params: { id: 1, whois: 'Mr. Poopybutthole' } })
      .then(res => expect(res).toEqual({ id: 1 }));
  });

  it('Should return null when no result', () => {
    docClient = {
      get: jest.fn((params, cb) => cb(null, {})),
      scan: jest.fn((params, cb) => cb(null, {
        Items: []
      })),
    };

    findOne({ docClient, TableName, tableKeyDefinition, params: { id: 1 } })
      .then(res => expect(res).toBe(null));
    findOne({ docClient, TableName, tableKeyDefinition, params: { id: 1, whois: 'Mr. Poopybutthole' } })
      .then(res => expect(res).toBe(null));
  });
});
