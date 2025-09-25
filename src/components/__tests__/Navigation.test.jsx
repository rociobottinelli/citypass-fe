import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navigation from '../Navigation';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'User', role: 'Ciudadano' },
    isAuthenticated: true,
    logout: jest.fn(),
  })
}));

describe('Navigation', () => {
  test('renders mobile and desktop containers', () => {
    render(
      <MemoryRouter initialEntries={["/ciudadano/dashboard"]}>
        <Navigation />
      </MemoryRouter>
    );

    // Has mobile bar title
    expect(screen.getByText('Emergency+')).toBeInTheDocument();
  });

  test('toggles mobile menu', () => {
    render(
      <MemoryRouter initialEntries={["/ciudadano/dashboard"]}>
        <Navigation />
      </MemoryRouter>
    );

    const toggle = screen.getAllByRole('button').pop();
    fireEvent.click(toggle);
  });
});


