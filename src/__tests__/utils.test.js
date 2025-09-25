import { cn } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('cn function', () => {
    test('combines class names correctly', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    test('handles conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'hidden');
      expect(result).toBe('base conditional');
    });

    test('handles undefined and null values', () => {
      const result = cn('base', undefined, null, 'valid');
      expect(result).toBe('base valid');
    });

    test('handles empty strings', () => {
      const result = cn('base', '', 'valid');
      expect(result).toBe('base valid');
    });

    test('handles arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    test('handles objects with boolean values', () => {
      const result = cn({
        'class1': true,
        'class2': false,
        'class3': true
      });
      expect(result).toBe('class1 class3');
    });

    test('handles mixed input types', () => {
      const result = cn(
        'base',
        ['array1', 'array2'],
        {
          'conditional1': true,
          'conditional2': false
        },
        'final'
      );
      expect(result).toBe('base array1 array2 conditional1 final');
    });
  });
});
