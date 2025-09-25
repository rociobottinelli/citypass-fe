import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FloatingEmergencyButton from '../FloatingEmergencyButton';

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('FloatingEmergencyButton', () => {
  test('renders floating emergency button', () => {
    render(
      <MemoryRouter>
        <FloatingEmergencyButton />
      </MemoryRouter>
    );

    // Checks for the Shield icon container
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});


