/**
 * @format
 */

import React from 'react';
import {render} from '@testing-library/react-native';
import App from '../App';

describe('Bug Tracker App', () => {
  test('renders correctly', () => {
    render(<App />);
  });

  test('displays login screen initially', () => {
    const component = render(<App />);
    expect(component.getByText('Bug Tracker')).toBeTruthy();
    expect(component.getByText('Login')).toBeTruthy();
    expect(component.getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(component.getByPlaceholderText('Enter your password')).toBeTruthy();
  });
});
