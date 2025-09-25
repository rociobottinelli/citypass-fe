// Simple test to verify Jest is working
describe('Jest Setup', () => {
  test('Jest is working correctly', () => {
    expect(1 + 1).toBe(2);
  });

  test('can use modern JavaScript features', () => {
    const obj = { a: 1, b: 2 };
    const { a, b } = obj;
    expect(a).toBe(1);
    expect(b).toBe(2);
  });

  test('can use async/await', async () => {
    const promise = Promise.resolve('test');
    const result = await promise;
    expect(result).toBe('test');
  });
});
