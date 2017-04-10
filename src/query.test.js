import {
  splitKeysAndParams,
  createFilterQuery,
  constructComparisonString,
  constructAttributeValue,
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
  it('Should support $ne operator', () => {
    expect(constructComparisonString('a', { $ne: 1})).toEqual(`(${keyPrefix}a <> ${valuePrefix}a)`);
  });
  it('Should support $in operator', () => {
    expect(constructComparisonString('a', { $in: ['b', 'c', 'd']})).toEqual(`(${keyPrefix}a IN ${valuePrefix}a)`);
  });
  it('Should support $nin operator', () => {
    expect(constructComparisonString('a', { $nin: ['b', 'c', 'd']})).toEqual(`(${keyPrefix}a NOT IN ${valuePrefix}a)`);
  });
});

describe('constructAttributeValue', () => {
  it('Should strip out values from comparison objects', () => {
    expect(constructAttributeValue('a', { $eq: 1 })).toEqual({ [`${valuePrefix}a`]: 1 });
    expect(constructAttributeValue('a', { $ne: 1 })).toEqual({ [`${valuePrefix}a`]: 1 });
    expect(constructAttributeValue('a', { $lt: 1 })).toEqual({ [`${valuePrefix}a`]: 1 });
    expect(constructAttributeValue('a', { $lte: 1 })).toEqual({ [`${valuePrefix}a`]: 1 });
    expect(constructAttributeValue('a', { $gt: 1 })).toEqual({ [`${valuePrefix}a`]: 1 });
    expect(constructAttributeValue('a', { $gte: 1 })).toEqual({ [`${valuePrefix}a`]: 1 });
    expect(constructAttributeValue('b', { $in: [1,2,3] })).toEqual({ [`${valuePrefix}b`]: [1,2,3] });
    expect(constructAttributeValue('b', { $nin: [1,2,3] })).toEqual({ [`${valuePrefix}b`]: [1,2,3] });
  });

  it('Should leave other objects alone', () => {
    expect(constructAttributeValue('a', { pink: 1, pony: 'Dead?' })).toEqual({ [`${valuePrefix}a`]: { pink: 1, pony: 'Dead?' } });
  });

  it('Should leave non objects alone', () => {
    expect(constructAttributeValue('a', 'sup')).toEqual({ [`${valuePrefix}a`]: 'sup' });
      expect(constructAttributeValue('a', 6)).toEqual({ [`${valuePrefix}a`]: 6 });
  });
});
