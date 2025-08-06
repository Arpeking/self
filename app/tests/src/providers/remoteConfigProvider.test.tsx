// SPDX-License-Identifier: BUSL-1.1; Copyright (c) 2025 Social Connect Labs, Inc.; Licensed under BUSL-1.1 (see LICENSE); Apache-2.0 from 2029-06-11

import React from 'react';
import { Text } from 'react-native';

import {
  RemoteConfigProvider,
  useRemoteConfig,
} from '../../../src/providers/remoteConfigProvider';
import { initRemoteConfig } from '../../../src/RemoteConfig';

import { render, waitFor } from '@testing-library/react-native';

// Mock the RemoteConfig module
jest.mock('../../../src/RemoteConfig', () => ({
  initRemoteConfig: jest.fn(),
}));

const mockInitRemoteConfig = initRemoteConfig as jest.MockedFunction<
  typeof initRemoteConfig
>;

// Test component that uses the hook
const TestComponent = () => {
  const { isInitialized, error } = useRemoteConfig();
  return (
    <>
      <Text testID="initialized">{isInitialized ? 'true' : 'false'}</Text>
      <Text testID="error">{error || 'none'}</Text>
    </>
  );
};

describe('RemoteConfigProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  it('should initialize successfully and set isInitialized to true', async () => {
    mockInitRemoteConfig.mockResolvedValue(undefined);

    const { getByTestId } = render(
      <RemoteConfigProvider>
        <TestComponent />
      </RemoteConfigProvider>,
    );

    // Initially should be false
    expect(getByTestId('initialized')).toHaveTextContent('false');
    expect(getByTestId('error')).toHaveTextContent('none');

    // Wait for initialization to complete
    await waitFor(() => {
      expect(getByTestId('initialized')).toHaveTextContent('true');
    });

    expect(getByTestId('error')).toHaveTextContent('none');
    expect(mockInitRemoteConfig).toHaveBeenCalledTimes(1);
  });

  it('should handle initialization errors gracefully', async () => {
    const errorMessage = 'Firebase initialization failed';
    mockInitRemoteConfig.mockRejectedValue(new Error(errorMessage));

    const { getByTestId } = render(
      <RemoteConfigProvider>
        <TestComponent />
      </RemoteConfigProvider>,
    );

    // Wait for initialization to complete (with error)
    await waitFor(() => {
      expect(getByTestId('initialized')).toHaveTextContent('true');
    });

    expect(getByTestId('error')).toHaveTextContent(errorMessage);
    expect(console.error).toHaveBeenCalledWith(
      'Failed to initialize remote config:',
      expect.any(Error),
    );
  });

  it('should handle non-Error rejection gracefully', async () => {
    mockInitRemoteConfig.mockRejectedValue('String error');

    const { getByTestId } = render(
      <RemoteConfigProvider>
        <TestComponent />
      </RemoteConfigProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('initialized')).toHaveTextContent('true');
    });

    expect(getByTestId('error')).toHaveTextContent('Unknown error');
  });

  it('should only initialize once', async () => {
    mockInitRemoteConfig.mockResolvedValue(undefined);

    const { rerender } = render(
      <RemoteConfigProvider>
        <TestComponent />
      </RemoteConfigProvider>,
    );

    await waitFor(() => {
      expect(mockInitRemoteConfig).toHaveBeenCalledTimes(1);
    });

    // Re-render the provider
    rerender(
      <RemoteConfigProvider>
        <TestComponent />
      </RemoteConfigProvider>,
    );

    // Should still only be called once
    expect(mockInitRemoteConfig).toHaveBeenCalledTimes(1);
  });
});
