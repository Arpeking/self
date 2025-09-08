// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import React, { Suspense, useEffect } from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text } from 'tamagui';
import type { StaticParamList } from '@react-navigation/native';
import {
  createNavigationContainerRef,
  createStaticNavigation,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DefaultNavBar } from '@/components/NavBar';
import AppLayout from '@/layouts/AppLayout';
import { getAesopScreens } from '@/navigation/aesop';
import devScreens from '@/navigation/devTools';
import documentScreens from '@/navigation/document';
import homeScreens from '@/navigation/home';
import proveScreens from '@/navigation/prove';
import recoveryScreens from '@/navigation/recovery';
import settingsScreens from '@/navigation/settings';
import systemScreens from '@/navigation/system';
import type { ProofHistory } from '@/stores/proof-types';
import analytics from '@/utils/analytics';
import { setupUniversalLinkListenerInNavigation } from '@/utils/deeplinks';

export const navigationScreens = {
  ...systemScreens,
  ...documentScreens,
  ...homeScreens,
  ...proveScreens,
  ...settingsScreens,
  ...recoveryScreens,
  ...devScreens, // allow in production for testing
  // add last to override other screens
  ...getAesopScreens(),
};
const AppNavigation = createNativeStackNavigator({
  id: undefined,
  initialRouteName: Platform.OS === 'web' ? 'Home' : 'Splash',
  screenOptions: {
    header: DefaultNavBar,
  },
  layout: AppLayout,
  screens: navigationScreens,
});

export type RootStackParamList = StaticParamList<typeof AppNavigation>;

// Create a ref that we can use to access the navigation state
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}

const { trackScreenView } = analytics();
const Navigation = createStaticNavigation(AppNavigation);

const SuspenseFallback = () => {
  if (Platform.OS === 'web') {
    return <div>Loading...</div>;
  }
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Loading...</Text>
    </View>
  );
};

const NavigationWithTracking = () => {
  const trackScreen = () => {
    const currentRoute = navigationRef.getCurrentRoute();
    if (currentRoute) {
      if (__DEV__) console.log(`Screen View: ${currentRoute.name}`);
      trackScreenView(`${currentRoute.name}`, {
        screenName: currentRoute.name,
      });
    }
  };

  // Setup universal link handling at the navigation level
  useEffect(() => {
    const cleanup = setupUniversalLinkListenerInNavigation();

    return () => {
      cleanup();
    };
  }, []);

  return (
    <GestureHandlerRootView>
      <Suspense fallback={<SuspenseFallback />}>
        <Navigation ref={navigationRef} onStateChange={trackScreen} />
      </Suspense>
    </GestureHandlerRootView>
  );
};

export default NavigationWithTracking;
