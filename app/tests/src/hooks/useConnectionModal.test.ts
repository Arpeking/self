// SPDX-License-Identifier: BUSL-1.1; Copyright (c) 2025 Social Connect Labs, Inc.; Licensed under BUSL-1.1 (see LICENSE); Apache-2.0 from 2029-06-11

import useConnectionModal from '@src/hooks/useConnectionModal';
import { useModal } from '@src/hooks/useModal';
import { act, renderHook } from '@testing-library/react-native';

jest.useFakeTimers();

jest.mock('@src/navigation', () => ({
  navigationRef: { isReady: jest.fn(() => true), navigate: jest.fn() },
}));

jest.mock('@src/hooks/useModal');
jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: jest
    .fn()
    .mockReturnValue({ isConnected: false, isInternetReachable: false }),
}));

const showModal = jest.fn();
const dismissModal = jest.fn();
(useModal as jest.Mock).mockReturnValue({
  showModal,
  dismissModal,
  visible: false,
});

describe('useConnectionModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows modal when no connection', () => {
    const { result } = renderHook(() => useConnectionModal());
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(showModal).toHaveBeenCalled();
    expect(result.current.visible).toBe(false);
  });

  it('dismisses modal when connection is restored', () => {
    (useModal as jest.Mock).mockReturnValue({
      showModal,
      dismissModal,
      visible: true,
    });

    const { useNetInfo } = require('@react-native-community/netinfo');
    useNetInfo.mockReturnValue({
      isConnected: true,
      isInternetReachable: true,
    });

    renderHook(() => useConnectionModal());
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(dismissModal).toHaveBeenCalled();
  });

  it('does not show modal when hideNetworkModal is true', () => {
    jest.doMock('@src/stores/settingStore', () => ({
      useSettingStore: jest.fn(() => true),
    }));

    renderHook(() => useConnectionModal());
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(showModal).not.toHaveBeenCalled();
  });

  it('does not show modal when navigation is not ready', () => {
    const { navigationRef } = require('@src/navigation');
    navigationRef.isReady.mockReturnValue(false);

    renderHook(() => useConnectionModal());
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(showModal).not.toHaveBeenCalled();
  });
});
