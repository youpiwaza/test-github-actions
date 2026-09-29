// sum.test.js
import sum from './sum';
import { describe, it, expect } from 'vitest';

describe('sum function', () => {
  it('should return the sum of two numbers', () => {
    expect(sum(1, 2)).toBe(3);
  });
});
