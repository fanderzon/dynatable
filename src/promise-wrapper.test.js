import promiseWrapper from './promise-wrapper';

const someApi = {
  methodA: () => {}
};
describe('promiseWrapper', () => {
  it('Should return a promise', () => {
    expect(promiseWrapper(someApi, 'methodA', {})).toBeInstanceOf(Promise);
  });
});
