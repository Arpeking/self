// SPDX-License-Identifier: BUSL-1.1; Copyright (c) 2025 Social Connect Labs, Inc.; Licensed under BUSL-1.1 (see LICENSE); Apache-2.0 from 2029-06-11

import { useProtocolStore } from '@/stores/protocolStore';
import { useProvingStore } from '@/utils/proving/provingMachine';

import { actorMock } from './actorMock';

jest.mock('xstate', () => {
  const { actorMock: mockActor } = require('./actorMock');
  return {
    createActor: jest.fn(() => mockActor),
    createMachine: jest.fn(),
    assign: jest.fn(),
    send: jest.fn(),
    spawn: jest.fn(),
    interpret: jest.fn(),
    fromPromise: jest.fn(),
    fromObservable: jest.fn(),
    fromEventObservable: jest.fn(),
    fromCallback: jest.fn(),
    fromTransition: jest.fn(),
    fromReducer: jest.fn(),
    fromRef: jest.fn(),
  };
});

jest.mock('@/utils/analytics', () => () => ({
  trackEvent: jest.fn(),
}));
jest.mock('@/providers/passportDataProvider', () => ({
  loadSelectedDocument: jest.fn(),
}));
jest.mock('@/providers/authProvider', () => ({
  unsafe_getPrivateKey: jest.fn(),
}));

describe('startFetchingData', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    const {
      loadSelectedDocument,
    } = require('@/providers/passportDataProvider');
    loadSelectedDocument.mockResolvedValue({
      data: {
        documentCategory: 'passport',
        mock: false,
        dsc_parsed: { authorityKeyIdentifier: 'key' },
      },
    });
    const { unsafe_getPrivateKey } = require('@/providers/authProvider');
    unsafe_getPrivateKey.mockResolvedValue('secret');

    // Create mock selfClient
    const mockSelfClient = {
      getPrivateKey: jest.fn().mockResolvedValue('mock-private-key'),
    };

    useProtocolStore.setState({
      passport: { fetch_all: jest.fn().mockResolvedValue(undefined) },
    } as any);
    await useProvingStore.getState().init(mockSelfClient as any, 'register');
    actorMock.send.mockClear();
    useProtocolStore.setState({
      passport: { fetch_all: jest.fn() },
    } as any);
    useProvingStore.setState({
      passportData: { documentCategory: 'passport', mock: false },
      env: 'prod',
    });
  });

  it('emits FETCH_ERROR when dsc_parsed is missing', async () => {
    await useProvingStore.getState().startFetchingData();

    expect(
      useProtocolStore.getState().passport.fetch_all,
    ).not.toHaveBeenCalled();
    expect(actorMock.send).toHaveBeenCalledWith({ type: 'FETCH_ERROR' });
  });
});
