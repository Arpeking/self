// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import AccountRecoveryChoiceScreen from '@/screens/account/recovery/AccountRecoveryChoiceScreen';
import AccountRecoveryScreen from '@/screens/account/recovery/AccountRecoveryScreen';
import DocumentDataNotFoundScreen from '@/screens/account/recovery/DocumentDataNotFoundScreen';
import RecoverWithPhraseScreen from '@/screens/account/recovery/RecoverWithPhraseScreen';
import CloudBackupScreen from '@/screens/account/settings/CloudBackupScreen';
import SettingsScreen from '@/screens/account/settings/SettingsScreen';
import ShowRecoveryPhraseScreen from '@/screens/account/settings/ShowRecoveryPhraseScreen';
import { black, slate300, white } from '@/utils/colors';

const accountScreens = {
  AccountRecovery: {
    screen: AccountRecoveryScreen,
    options: {
      headerShown: false,
    } as NativeStackNavigationOptions,
  },
  AccountRecoveryChoice: {
    screen: AccountRecoveryChoiceScreen,
    options: {
      headerShown: false,
    } as NativeStackNavigationOptions,
  },
  RecoverWithPhrase: {
    screen: RecoverWithPhraseScreen,
    options: {
      headerTintColor: black,
      title: 'Enter Recovery Phrase',
      headerStyle: {
        backgroundColor: black,
      },
      headerTitleStyle: {
        color: slate300,
      },
      headerBackTitle: 'close',
    } as NativeStackNavigationOptions,
  },
  DocumentDataNotFound: {
    screen: DocumentDataNotFoundScreen,
    options: {
      headerShown: false,
    } as NativeStackNavigationOptions,
  },
  CloudBackupSettings: {
    screen: CloudBackupScreen,
    options: {
      title: 'Cloud backup',
      headerStyle: {
        backgroundColor: black,
      },
      headerTitleStyle: {
        color: slate300,
      },
    } as NativeStackNavigationOptions,
  },
  Settings: {
    screen: SettingsScreen,
    options: {
      animation: 'slide_from_bottom',
      title: 'Settings',
      headerStyle: {
        backgroundColor: white,
      },
      headerTitleStyle: {
        color: black,
      },
    } as NativeStackNavigationOptions,
    config: {
      screens: {},
    },
  },
  ShowRecoveryPhrase: {
    screen: ShowRecoveryPhraseScreen,
    options: {
      title: 'Recovery Phrase',
      headerStyle: {
        backgroundColor: white,
      },
    } as NativeStackNavigationOptions,
  },
};

export default accountScreens;
