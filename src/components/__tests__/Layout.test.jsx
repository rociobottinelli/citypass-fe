import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../Layout';

jest.mock('../Navigation', () => () => <div data-testid="navigation" />);
jest.mock('../FloatingEmergencyButton', () => () => <div data-testid="floating-button" />);

describe('Layout', () => {
  test('renders navigation, content, and floating button', () => {
    render(
      <MemoryRouter>
        <Layout>
          <div data-testid="content">Hello</div>
        </Layout>
      </MemoryRouter>
    );

    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('floating-button')).toBeInTheDocument();
  });
});


