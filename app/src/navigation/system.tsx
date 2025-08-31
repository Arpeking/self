// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import React, { lazy } from 'react';
import { SystemBars } from 'react-native-edge-to-edge';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

// Important: SplashScreen is imported directly and not lazy-loaded.
// This is because it's used as a fallback for the Suspense boundary in the root navigator,
// ensuring it's immediately available at startup.
import SplashScreen from '@/screens/system/SplashScreen';
import { black } from '@/utils/colors';

const LaunchScreen = lazy(() => import('@/screens/system/LaunchScreen'));
const LoadingScreen = lazy(() => import('@/screens/system/Loading'));
const ModalScreen = lazy(() => import('@/screens/system/ModalScreen'));
const DeferredLinkingInfoScreen = lazy(
  () => import('@/screens/system/DeferredLinkingInfoScreen'),
);

const systemScreens = {
  Launch: {
    screen: LaunchScreen,
    options: {
      header: () => <SystemBars style="light" />,
      navigationBarColor: black,
    },
  },
  Loading: {
    screen: LoadingScreen,
    options: {
      headerShown: false,
      navigationBarColor: black,
    } as NativeStackNavigationOptions,
  },
  Modal: {
    screen: ModalScreen,
    options: {
      headerShown: false,
      presentation: 'transparentModal',
      animation: 'fade',
      contentStyle: { backgroundColor: 'transparent' },
    } as NativeStackNavigationOptions,
  },
  DeferredLinkingInfo: {
    screen: DeferredLinkingInfoScreen,
    options: {
      headerShown: false,
    } as NativeStackNavigationOptions,
  },

  Splash: {
    screen: SplashScreen,
    options: {
      header: () => <SystemBars style="light" />,
      navigationBarColor: black,
    },
  },
};

export default systemScreens;
