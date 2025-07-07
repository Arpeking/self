// SPDX-License-Identifier: BUSL-1.1; Copyright (c) 2025 Social Connect Labs, Inc.; Licensed under BUSL-1.1 (see LICENSE); Apache-2.0 from 2029-06-11

import { act, renderHook } from '@testing-library/react-native';

jest.mock('../../../src/providers/authProvider', () => ({
  useAuth: jest.fn(),
}));

import useMnemonic from '../../../src/hooks/useMnemonic';
import { useAuth } from '../../../src/providers/authProvider';

jest.mock('ethers', () => ({
  ethers: {
    Mnemonic: {
      fromEntropy: jest.fn().mockReturnValue({ phrase: 'one two three four' }),
    },
  },
}));

const getOrCreateMnemonic = jest.fn();
(useAuth as jest.Mock).mockReturnValue({ getOrCreateMnemonic });

describe('useMnemonic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads mnemonic', async () => {
    getOrCreateMnemonic.mockResolvedValue({ data: { entropy: '0x00' } });
    const { result } = renderHook(() => useMnemonic());
    await act(async () => {
      await result.current.loadMnemonic();
    });
    expect(result.current.mnemonic).toEqual(['one', 'two', 'three', 'four']);
  });

  it('handles missing mnemonic', async () => {
    getOrCreateMnemonic.mockResolvedValue(null);
    const { result } = renderHook(() => useMnemonic());
    await act(async () => {
      await result.current.loadMnemonic();
    });
    expect(result.current.mnemonic).toBeUndefined();
  });
});
