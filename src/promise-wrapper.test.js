import promiseWrapper from './promise-wrapper';

const pinkPony = {pink: 'pony'};
const deadPony = new Error('dead pony');
const someApi = {
  methodA: () => {},
  methodB: (params, cb) => cb(null, pinkPony)
};
describe('promiseWrapper', () => {
  it('Should return a promise', () => {
    expect(promiseWrapper(someApi, 'methodA', {})).toBeInstanceOf(Promise);
  });
  it('Should resolve with callback value', () => {
    promiseWrapper(someApi, 'methodB', {})
      .then(data => expect(data).toEqual(pinkPony));
  });
  it('Should reject with callback error', () => {
    promiseWrapper(someApi, 'methodB', {})
      .catch(err => expect(err).toBe(deadPony))
  });
  it('Should reject with when calling undefined methods', () => {
    promiseWrapper(someApi, 'methodZ', {})
      .catch(err => expect(err).toBeDefined())
  });
});
