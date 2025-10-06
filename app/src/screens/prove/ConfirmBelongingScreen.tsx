// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import React, { useEffect, useState } from 'react';
import type { StaticScreenProps } from '@react-navigation/native';
import { usePreventRemove } from '@react-navigation/native';

import { useSelfClient } from '@selfxyz/mobile-sdk-alpha';
import {
  PassportEvents,
  ProofEvents,
} from '@selfxyz/mobile-sdk-alpha/constants/analytics';
import {
  getPreRegistrationDescription,
  usePrepareDocumentProof,
} from '@selfxyz/mobile-sdk-alpha/onboarding/confirm-identification';

import successAnimation from '@/assets/animations/loading/success.json';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { DelayedLottieView } from '@/components/DelayedLottieView';
import Description from '@/components/typography/Description';
import { Title } from '@/components/typography/Title';
import useHapticNavigation from '@/hooks/useHapticNavigation';
import { ExpandableBottomLayout } from '@/layouts/ExpandableBottomLayout';
import { styles } from '@/screens/prove/ProofRequestStatusScreen';
import { useSettingStore } from '@/stores/settingStore';
import { flushAllAnalytics, trackNfcEvent } from '@/utils/analytics';
import { black, white } from '@/utils/colors';
import { notificationSuccess } from '@/utils/haptic';
import {
  getFCMToken,
  requestNotificationPermission,
} from '@/utils/notifications/notificationService';

type ConfirmBelongingScreenProps = StaticScreenProps<Record<string, never>>;

const ConfirmBelongingScreen: React.FC<ConfirmBelongingScreenProps> = () => {
  const selfClient = useSelfClient();
  const { trackEvent } = selfClient;
  const navigate = useHapticNavigation('Loading', {
    params: {},
  });
  const [_requestingPermission, setRequestingPermission] = useState(false);
  const setFcmToken = useSettingStore(state => state.setFcmToken);

  useEffect(() => {
    notificationSuccess();
  }, []);

  const onOkPress = async () => {
    try {
      setRequestingPermission(true);
      trackEvent(ProofEvents.NOTIFICATION_PERMISSION_REQUESTED);
      trackNfcEvent(ProofEvents.NOTIFICATION_PERMISSION_REQUESTED);

      // Request notification permission
      const permissionGranted = await requestNotificationPermission();
      if (permissionGranted) {
        const token = await getFCMToken();
        if (token) {
          setFcmToken(token);
          trackEvent(ProofEvents.FCM_TOKEN_STORED);
        }
      }

      navigate();
    } catch (error: unknown) {
      console.error('Error navigating:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      trackEvent(ProofEvents.PROVING_PROCESS_ERROR, {
        error: message,
      });
      trackNfcEvent(ProofEvents.PROVING_PROCESS_ERROR, {
        error: message,
      });

      flushAllAnalytics();
    }
  };

  // Prevents back navigation
  usePreventRemove(true, () => {});

  return (
    <>
      <ExpandableBottomLayout.Layout backgroundColor={black}>
        <ExpandableBottomLayout.TopSection backgroundColor={black}>
          <DelayedLottieView
            autoPlay
            loop={false}
            source={successAnimation}
            style={styles.animation}
            cacheComposition={true}
            renderMode="HARDWARE"
          />
        </ExpandableBottomLayout.TopSection>
        <ExpandableBottomLayout.BottomSection
          gap={20}
          paddingBottom={20}
          backgroundColor={white}
        >
          <Title textAlign="center">Confirm your identity</Title>
          <Description textAlign="center" paddingBottom={20}>
            {getPreRegistrationDescription()}
          </Description>
          <PrimaryButton
            trackEvent={PassportEvents.OWNERSHIP_CONFIRMED}
            onPress={onOkPress}
          >
            Confirm
          </PrimaryButton>
        </ExpandableBottomLayout.BottomSection>
      </ExpandableBottomLayout.Layout>
    </>
  );
};

export default ConfirmBelongingScreen;
