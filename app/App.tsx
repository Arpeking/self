// SPDX-License-Identifier: BUSL-1.1; Copyright (c) 2025 Social Connect Labs, Inc.; Licensed under BUSL-1.1 (see LICENSE); Apache-2.0 from 2029-06-11

import 'react-native-get-random-values';

import { Buffer } from 'buffer';
import React, { lazy, Suspense } from 'react';
import { YStack } from 'tamagui';

import ErrorBoundary from './src/components/ErrorBoundary';
import AppNavigation from './src/navigation';
import { AuthProvider } from './src/providers/authProvider';
import { DatabaseProvider } from './src/providers/databaseProvider';
import { NotificationTrackingProvider } from './src/providers/notificationTrackingProvider';
import LoadingScreen from './src/screens/misc/LoadingScreen';

const PassportProvider = lazy(() =>
  import('./src/providers/passportDataProvider').then(m => ({
    default: m.PassportProvider,
  })),
);
import { RemoteConfigProvider } from './src/providers/remoteConfigProvider';
import { initSentry, wrapWithSentry } from './src/Sentry';

initSentry();

global.Buffer = Buffer;

function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <YStack flex={1} height="100%" width="100%">
        <RemoteConfigProvider>
          <AuthProvider>
            <Suspense fallback={<LoadingScreen />}>
              <PassportProvider>
                <DatabaseProvider>
                  <NotificationTrackingProvider>
                    <AppNavigation />
                  </NotificationTrackingProvider>
                </DatabaseProvider>
              </PassportProvider>
            </Suspense>
          </AuthProvider>
        </RemoteConfigProvider>
      </YStack>
    </ErrorBoundary>
  );
}

export default wrapWithSentry(App);
