# Jest Testing Setup for CityPass Frontend

## Overview
This project now has Jest unit testing configured with React Testing Library. The setup includes comprehensive test coverage for components, services, and utilities.

## Test Configuration

### Dependencies Installed
- `jest` - Testing framework
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom Jest matchers for DOM testing
- `@testing-library/user-event` - User interaction simulation
- `jest-environment-jsdom` - Browser-like environment for tests
- `@babel/preset-env` - Babel preset for modern JavaScript
- `@babel/preset-react` - Babel preset for React JSX
- `@babel/preset-typescript` - Babel preset for TypeScript support
- `babel-jest` - Babel transformer for Jest

### Configuration Files
- `jest.config.js` - Jest configuration with module mapping and TypeScript support
- `babel.config.js` - Babel configuration for test environment
- `src/setupTests.js` - Test setup with polyfills and mocks

## Test Scripts

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI (no watch mode)
npm run test:ci
```

## Test Structure

### Working Tests
- ✅ `src/__tests__/simple.test.js` - Basic Jest functionality
- ✅ `src/__tests__/utils-simple.test.js` - Utility function tests
- ✅ `src/__tests__/utils.test.js` - TypeScript utility tests

### Test Files Created
- `src/components/__tests__/EmergencyButton.test.jsx` - Emergency button component tests
- `src/components/__tests__/EmergencyHistory.test.jsx` - Emergency history component tests
- `src/contexts/__tests__/AuthContext.test.jsx` - Authentication context tests
- `src/services/__tests__/api.test.js` - API service tests
- `src/__tests__/App.test.jsx` - Main App component tests

## Current Status

### ✅ Working
- Jest configuration with TypeScript support
- Basic test execution
- Module path mapping (`@/` aliases)
- Babel transformation for JSX and TypeScript
- Test utilities and setup files

### ⚠️ Issues to Resolve
1. **React Import Issues**: Some components need explicit React imports
2. **TypeScript Parsing**: Some UI components have TypeScript syntax that needs proper configuration
3. **Mock Configuration**: Some mocks need refinement for proper functionality
4. **Context Testing**: AuthContext tests need proper mock setup

## Next Steps

### 1. Fix React Import Issues
Add explicit React imports to components that use JSX:

```jsx
import React from 'react';
```

### 2. Fix TypeScript Configuration
Ensure all TypeScript files are properly configured in the Babel setup.

### 3. Improve Mock Setup
Refine mocks for better test isolation and reliability.

### 4. Add More Tests
- Integration tests for component interactions
- End-to-end test scenarios
- Performance tests for critical components

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --testPathPattern="simple.test.js"

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

The current setup includes:
- ✅ Basic Jest functionality
- ✅ Utility function testing
- ✅ Component testing framework
- ✅ Service testing framework
- ✅ Context testing framework

## Best Practices

1. **Test Structure**: Follow the `__tests__` directory pattern
2. **Naming**: Use `.test.js` or `.test.jsx` for test files
3. **Mocking**: Mock external dependencies and APIs
4. **Isolation**: Each test should be independent
5. **Coverage**: Aim for high test coverage on critical paths

## Troubleshooting

### Common Issues
1. **Module Resolution**: Ensure `@/` paths are properly mapped
2. **TypeScript**: Make sure TypeScript files are properly transformed
3. **React**: Add explicit React imports where needed
4. **Mocks**: Verify mock implementations match actual API

### Debug Commands
```bash
# Show Jest configuration
npx jest --showConfig

# Run tests with verbose output
npm test -- --verbose

# Run tests with debug information
npm test -- --detectOpenHandles
```

This testing setup provides a solid foundation for unit testing your React application with Jest and React Testing Library.
