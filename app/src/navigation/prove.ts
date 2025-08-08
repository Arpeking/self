// SPDX-License-Identifier: BUSL-1.1; Copyright (c) 2025 Social Connect Labs, Inc.; Licensed under BUSL-1.1 (see LICENSE); Apache-2.0 from 2029-06-11

import { lazy } from 'react';

import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { black, white } from '@src/utils/colors';

const ConfirmBelongingScreen = lazy(
  () => import('@src/screens/prove/ConfirmBelongingScreen'),
);
const ProofRequestStatusScreen = lazy(
  () => import('@src/screens/prove/ProofRequestStatusScreen'),
);
const ProveScreen = lazy(() => import('@src/screens/prove/ProveScreen'));
const QRCodeTroubleScreen = lazy(
  () => import('@src/screens/prove/QRCodeTroubleScreen'),
);
const QRCodeViewFinderScreen = lazy(
  () => import('@src/screens/prove/ViewFinderScreen'),
);

const proveScreens = {
  ConfirmBelongingScreen: {
    screen: ConfirmBelongingScreen,
    options: {
      headerShown: false,
    } as NativeStackNavigationOptions,
  },
  ProofRequestStatusScreen: {
    screen: ProofRequestStatusScreen,
    options: {
      headerShown: false,
      animation: 'slide_from_bottom',
    } as NativeStackNavigationOptions,
  },
  ProveScreen: {
    screen: ProveScreen,
    options: {
      title: 'Request Proof',
      headerStyle: {
        backgroundColor: black,
      },
      headerTitleStyle: {
        color: white,
      },
    } as NativeStackNavigationOptions,
  },
  QRCodeTrouble: {
    screen: QRCodeTroubleScreen,
    options: {
      headerShown: false,
      animation: 'slide_from_bottom',
      presentation: 'modal',
    } as NativeStackNavigationOptions,
  },
  QRCodeViewFinder: {
    screen: QRCodeViewFinderScreen,
    options: {
      headerShown: false,
      animation: 'slide_from_bottom',
      // presentation: 'modal',
    } as NativeStackNavigationOptions,
  },
};

export default proveScreens;
