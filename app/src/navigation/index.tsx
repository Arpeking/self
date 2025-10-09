// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { StaticParamList } from '@react-navigation/native';
import {
  createNavigationContainerRef,
  createStaticNavigation,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useSelfClient } from '@selfxyz/mobile-sdk-alpha';

import { DefaultNavBar } from '@/components/NavBar';
import AppLayout from '@/layouts/AppLayout';
import accountScreens from '@/navigation/account';
import appScreens from '@/navigation/app';
import devScreens from '@/navigation/devTools';
import documentsScreens from '@/navigation/documents';
import homeScreens from '@/navigation/home';
import onboardingScreens from '@/navigation/onboarding';
import sharedScreens from '@/navigation/shared';
import verificationScreens from '@/navigation/verification';
import analytics from '@/utils/analytics';
import { setupUniversalLinkListenerInNavigation } from '@/utils/deeplinks';

export const navigationScreens = {
  ...appScreens,
  ...onboardingScreens,
  ...homeScreens,
  ...documentsScreens,
  ...verificationScreens,
  ...accountScreens,
  ...sharedScreens,
  ...devScreens, // allow in production for testing
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

const NavigationWithTracking = () => {
  const selfClient = useSelfClient();
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
    const cleanup = setupUniversalLinkListenerInNavigation(selfClient);

    return () => {
      cleanup();
    };
  }, [selfClient]);

  return (
    <GestureHandlerRootView>
      <Navigation ref={navigationRef} onStateChange={trackScreen} />
    </GestureHandlerRootView>
  );
};

export default NavigationWithTracking;
