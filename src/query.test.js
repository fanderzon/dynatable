import { splitKeysAndParams } from './query';

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
