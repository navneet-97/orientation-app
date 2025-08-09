import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app header title', () => {
  render(<App />);
  expect(screen.getByText(/Prompt This Into Existence — Mobile/i)).toBeInTheDocument();
});
