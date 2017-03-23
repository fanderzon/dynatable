import { isObject, isFunction } from './util';

const arrayA = [];
const arrayB = [1,'2',3];
const objectA = {};
const objectB = {id: null};
const objectC = {arr: arrayB, id: 12};
const funcA = () => {};
const funcB = () => objectA;

describe('isObject', () => {
  it('recognizes objects as objects', () => {
    expect(isObject(objectA)).toBe(true);
    expect(isObject(objectB)).toBe(true);
    expect(isObject(objectC)).toBe(true);
  });

  it('Does not recognize arrays as objects', () => {
    expect(isObject(arrayA)).toBe(false);
    expect(isObject(arrayB)).toBe(false);
  });

  it('Does not recognize anything else as objects', () => {
    expect(isObject(undefined)).toBe(false);
    expect(isObject(NaN)).toBe(false);
    expect(isObject(null)).toBe(false);
    expect(isObject(funcA)).toBe(false);
    expect(isObject(funcB)).toBe(false);
  });
});

describe('isFunction', () => {
  it('recognizes functions as objects', () => {
    expect(isFunction(funcA)).toBe(true);
    expect(isFunction(funcB)).toBe(true);
  });

  it('Does not recognize anything else as functions', () => {
    expect(isFunction(undefined)).toBe(false);
    expect(isFunction(NaN)).toBe(false);
    expect(isFunction(null)).toBe(false);
    expect(isFunction(objectA)).toBe(false);
    expect(isFunction(objectB)).toBe(false);
    expect(isFunction(objectC)).toBe(false);
    expect(isFunction(arrayA)).toBe(false);
    expect(isFunction(arrayB)).toBe(false);
  });
});
