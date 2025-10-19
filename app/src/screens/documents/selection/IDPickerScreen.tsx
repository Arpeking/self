// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RouteProp } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';

import { YStack } from '@selfxyz/mobile-sdk-alpha/components';
import IDSelection from '@selfxyz/mobile-sdk-alpha/onboarding/id-selection-screen';

import { DocumentFlowNavBar } from '@/components/NavBar/DocumentFlowNavBar';
import type { RootStackParamList } from '@/navigation';
import { slate100 } from '@/utils/colors';
import { extraYPadding } from '@/utils/constants';

type IDPickerScreenRouteProp = RouteProp<RootStackParamList, 'IDPicker'>;

const IDPickerScreen: React.FC = () => {
  const route = useRoute<IDPickerScreenRouteProp>();
  const { countryCode = '', documentTypes = [] } = route.params || {};
  const bottom = useSafeAreaInsets().bottom;

  return (
    <YStack
      flex={1}
      backgroundColor={slate100}
      paddingBottom={bottom + extraYPadding + 24}
    >
      <DocumentFlowNavBar title="GETTING STARTED" />
      <IDSelection countryCode={countryCode} documentTypes={documentTypes} />
    </YStack>
  );
};

export default IDPickerScreen;
