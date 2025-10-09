// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { HomeNavBar } from '@/components/NavBar';
import HomeScreen from '@/screens/home/HomeScreen';
import ProofHistoryDetailScreen from '@/screens/home/ProofHistoryDetailScreen';
import ProofHistoryScreen from '@/screens/home/ProofHistoryScreen';

const homeScreens = {
  Home: {
    screen: HomeScreen,
    options: {
      title: 'Self',
      header: HomeNavBar,
      presentation: 'card',
    } as NativeStackNavigationOptions,
  },
  ProofHistory: {
    screen: ProofHistoryScreen,
    options: {
      title: 'Approved Requests',
      headerBackTitle: 'close',
    },
  },
  ProofHistoryDetail: {
    screen: ProofHistoryDetailScreen,
    options: {
      title: 'Approval',
    },
  },
};

export default homeScreens;
