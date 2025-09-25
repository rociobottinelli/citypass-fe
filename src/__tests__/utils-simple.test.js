// Test utility functions without TypeScript dependencies
describe('Utility Functions', () => {
  test('can combine class names', () => {
    const combineClasses = (...classes) => {
      return classes.filter(Boolean).join(' ');
    };
    
    expect(combineClasses('base', 'active')).toBe('base active');
    expect(combineClasses('base', null, 'active')).toBe('base active');
    expect(combineClasses('base', false, 'active')).toBe('base active');
  });

  test('can handle conditional classes', () => {
    const combineClasses = (...classes) => {
      return classes.filter(Boolean).join(' ');
    };
    
    const isActive = true;
    const isDisabled = false;
    
    const result = combineClasses(
      'button',
      isActive && 'active',
      isDisabled && 'disabled'
    );
    
    expect(result).toBe('button active');
  });
});
