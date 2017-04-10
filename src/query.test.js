import {
  splitKeysAndParams,
  createFilterQuery,
  constructComparisonString,
  keyPrefix,
  valuePrefix
} from './query';

const paramsA = { id: 1, name: 'pink pony', interests: 'ponying?' };
const keysA = { id: 'N' };

describe('splitKeysAndParams', () => {
  it('Should split out the keys into an object at index 0', () => {
    expect(splitKeysAndParams(paramsA, keysA)[0]).toEqual({id: 1});
  });
  it('Should split out the params into an object at index 1', () => {
    expect(splitKeysAndParams(paramsA, keysA)[1]).toEqual({name: 'pink pony', interests: 'ponying?'});
  });

  it('Should return null on faulty input', () => {
    expect(splitKeysAndParams('a string', keysA)).toEqual(null);
    expect(splitKeysAndParams(paramsA, ['1', 2, 3])).toEqual(null);
  });
});

describe('createFilterQuery', () => {
  it('Should create filter expression out of single key/value pair', () => {
    expect(createFilterQuery({ a: 1 })).toEqual({ExpressionAttributeNames: {'#dta': 'a'}, ExpressionAttributeValues: {':dta': 1}, FilterExpression: '(#dta = :dta)'});
  });
});

describe('constructComparisonString', () => {
  it('Should default to equality', () => {
    expect(constructComparisonString('a', 1)).toEqual(`(${keyPrefix}a = ${valuePrefix}a)`);
    expect(constructComparisonString('a', {pinkPony: 1})).toEqual(`(${keyPrefix}a = ${valuePrefix}a)`);
  });
  it('Should support $gt operator', () => {
    expect(constructComparisonString('a', { $gt: 1})).toEqual(`(${keyPrefix}a > ${valuePrefix}a)`);
  });
  it('Should support $gte operator', () => {
    expect(constructComparisonString('a', { $gte: 1})).toEqual(`(${keyPrefix}a >= ${valuePrefix}a)`);
  });
  it('Should support $lt operator', () => {
    expect(constructComparisonString('a', { $lt: 1})).toEqual(`(${keyPrefix}a < ${valuePrefix}a)`);
  });
  it('Should support $lte operator', () => {
    expect(constructComparisonString('a', { $lte: 1})).toEqual(`(${keyPrefix}a <= ${valuePrefix}a)`);
  });
});
