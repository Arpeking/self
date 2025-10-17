// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import React, { useCallback } from 'react';
import { styled, View, XStack, YStack } from 'tamagui';
import type { StaticScreenProps } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import {
  Description,
  PrimaryButton,
  SecondaryButton,
  Title,
} from '@selfxyz/mobile-sdk-alpha/components';

import ModalClose from '@/images/icons/modal_close.svg';
import LogoInversed from '@/images/logo_inversed.svg';
import { white } from '@/utils/colors';
import { confirmTap, impactLight } from '@/utils/haptic';
import {
  getModalCallbacks,
  unregisterModalCallbacks,
} from '@/utils/modalCallbackRegistry';

const ModalBackDrop = styled(View, {
  display: 'flex',
  alignItems: 'center',
  // TODO cannot use filter(blur), so increased opacity
  backgroundColor: '#000000BB',
  alignContent: 'center',
  alignSelf: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
});

export interface ModalNavigationParams
  extends Omit<ModalParams, 'onButtonPress' | 'onModalDismiss'> {
  callbackId: number;
}

export interface ModalParams extends Record<string, unknown> {
  titleText: string;
  bodyText: string;
  buttonText: React.ReactNode;
  secondaryButtonText?: React.ReactNode;
  onButtonPress: (() => Promise<void>) | (() => void);
  onModalDismiss: () => void;
  preventDismiss?: boolean;
}

type ModalScreenProps = StaticScreenProps<ModalNavigationParams>;

const ModalScreen: React.FC<ModalScreenProps> = ({ route: { params } }) => {
  const navigation = useNavigation();
  const callbacks = getModalCallbacks(params.callbackId);

  const onButtonPressed = useCallback(async () => {
    confirmTap();

    // Check if callbacks and onButtonPress are defined
    if (!callbacks || !callbacks.onButtonPress) {
      console.warn('Modal callbacks not found or onButtonPress not defined');
      return;
    }

    try {
      // Try to execute the callback first
      await callbacks.onButtonPress();

      try {
        // If callback succeeds, try to navigate back
        navigation.goBack();
        // Only unregister after successful navigation
        unregisterModalCallbacks(params.callbackId);
      } catch (navigationError) {
        console.error('Navigation error:', navigationError);
        // Don't cleanup if navigation fails - modal might still be visible
      }
    } catch (callbackError) {
      console.error('Callback error:', callbackError);
      // If callback fails, we should still try to navigate and cleanup
      try {
        navigation.goBack();
        unregisterModalCallbacks(params.callbackId);
      } catch (navigationError) {
        console.error(
          'Navigation error after callback failure:',
          navigationError,
        );
        // Don't cleanup if navigation fails
      }
    }
  }, [callbacks, navigation, params.callbackId]);

  const onClose = useCallback(() => {
    impactLight();
    navigation.goBack();
    callbacks?.onModalDismiss();
    unregisterModalCallbacks(params.callbackId);
  }, [callbacks, navigation, params.callbackId]);

  return (
    <ModalBackDrop>
      <View
        backgroundColor={white}
        padding={20}
        borderRadius={10}
        marginHorizontal={8}
      >
        <YStack gap={40}>
          <XStack alignItems="center" justifyContent="space-between">
            <LogoInversed />
            {params?.preventDismiss ? null : <ModalClose onPress={onClose} />}
          </XStack>
          <YStack gap={20}>
            <Title style={{ textAlign: 'left' }}>
              {params?.titleText as React.ReactNode}
            </Title>
            <Description style={{ textAlign: 'left' }}>
              {params?.bodyText as React.ReactNode}
            </Description>
          </YStack>
          <YStack gap={12}>
            <PrimaryButton onPress={onButtonPressed}>
              {(params?.buttonText as React.ReactNode) || ''}
            </PrimaryButton>
            {params?.secondaryButtonText && (
              <SecondaryButton onPress={onClose}>
                {(params?.secondaryButtonText as React.ReactNode) || ''}
              </SecondaryButton>
            )}
          </YStack>
        </YStack>
      </View>
    </ModalBackDrop>
  );
};

export default ModalScreen;
