import { splitKeysAndParams } from './query';

const paramsA = { id: 1, name: 'pink pony', interests: 'ponying?' };
const keysA = { id: 'N' };

describe('splitKeysAndParams', () => {
  it('Should work', () => {
    expect(splitKeysAndParams(paramsA, keysA)[0]).toEqual({id: 1});
  });
});
