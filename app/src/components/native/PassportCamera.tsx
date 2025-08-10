// SPDX-License-Identifier: BUSL-1.1; Copyright (c) 2025 Social Connect Labs, Inc.; Licensed under BUSL-1.1 (see LICENSE); Apache-2.0 from 2029-06-11

import React, { useCallback } from 'react';
import {
  type NativeSyntheticEvent,
  PixelRatio,
  Platform,
  requireNativeComponent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { extractMRZInfo } from '@selfxyz/mobile-sdk-alpha';

import { RCTFragment } from '@src/components/native/RCTFragment';

interface NativePassportOCRViewProps {
  onPassportRead: (
    event: NativeSyntheticEvent<{
      data:
        | string
        | {
            documentNumber: string;
            expiryDate: string;
            birthDate: string;
            documentType: string;
            countryCode: string;
          };
    }>,
  ) => void;
  onError: (
    event: NativeSyntheticEvent<{
      error: string;
      errorMessage: string;
      stackTrace: string;
    }>,
  ) => void;
  style?: StyleProp<ViewStyle>;
}

const RCTPassportOCRViewNativeComponent = Platform.select({
  ios: requireNativeComponent<NativePassportOCRViewProps>('PassportOCRView'),
  android: requireNativeComponent<NativePassportOCRViewProps>(
    'PassportOCRViewManager',
  ),
});

if (!RCTPassportOCRViewNativeComponent) {
  throw new Error('PassportOCRViewManager not registered for this platform');
}

export interface PassportCameraProps {
  isMounted: boolean;
  onPassportRead: (
    error: Error | null,
    mrzData?: ReturnType<typeof extractMRZInfo>,
  ) => void;
}

export const PassportCamera: React.FC<PassportCameraProps> = ({
  onPassportRead,
  isMounted,
}) => {
  const _onError = useCallback(
    (
      event: NativeSyntheticEvent<{
        error: string;
        errorMessage: string;
        stackTrace: string;
      }>,
    ) => {
      if (!isMounted) {
        return;
      }
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const { error, errorMessage, stackTrace } = event.nativeEvent;
      const e = new Error(errorMessage);
      e.stack = stackTrace;
      onPassportRead(e);
    },
    [onPassportRead, isMounted],
  );

  const _onPassportRead = useCallback(
    (
      event: NativeSyntheticEvent<{
        data:
          | string
          | {
              documentNumber: string;
              expiryDate: string;
              birthDate: string;
              documentType: string;
              countryCode: string;
            };
      }>,
    ) => {
      if (!isMounted) {
        return;
      }
      if (typeof event.nativeEvent.data === 'string') {
        onPassportRead(null, extractMRZInfo(event.nativeEvent.data));
      } else {
        onPassportRead(null, {
          passportNumber: event.nativeEvent.data.documentNumber,
          dateOfBirth: event.nativeEvent.data.birthDate,
          dateOfExpiry: event.nativeEvent.data.expiryDate,
          documentType: event.nativeEvent.data.documentType,
          issuingCountry: event.nativeEvent.data.countryCode,
          nationality: event.nativeEvent.data.countryCode, // TODO: Verify if native module provides separate nationality code instead of defaulting to issuingCountry
          surname: '', // Fill with defaults as they're required
          givenNames: '',
          sex: '',
          validation: {
            format: false, // Changed from true - avoid assuming validation success before actual checks
            passportNumberChecksum: false, // Changed from true - avoid assuming validation success before actual checks
            dateOfBirthChecksum: false, // Changed from true - avoid assuming validation success before actual checks
            dateOfExpiryChecksum: false, // Changed from true - avoid assuming validation success before actual checks
            compositeChecksum: false, // Changed from true - avoid assuming validation success before actual checks
            overall: false, // Changed from true - avoid assuming validation success before actual checks
          },
          // TODO: If raw MRZ lines are accessible from native module, pass them to extractMRZInfo function to perform real checksum validations
        });
      }
    },
    [onPassportRead, isMounted],
  );

  if (Platform.OS === 'ios') {
    return (
      <RCTPassportOCRViewNativeComponent
        onPassportRead={_onPassportRead}
        onError={_onError}
        style={{
          width: '130%',
          height: '130%',
        }}
      />
    );
  } else {
    // For Android, wrap the native component inside your RCTFragment to preserve existing functionality.
    const Fragment = RCTFragment as React.FC<
      React.ComponentProps<typeof RCTFragment> & NativePassportOCRViewProps
    >;
    return (
      <Fragment
        RCTFragmentViewManager={
          RCTPassportOCRViewNativeComponent as ReturnType<
            typeof requireNativeComponent
          >
        }
        fragmentComponentName="PassportOCRViewManager"
        isMounted={isMounted}
        style={{
          height: PixelRatio.getPixelSizeForLayoutSize(800),
          width: PixelRatio.getPixelSizeForLayoutSize(400),
        }}
        onError={_onError}
        onPassportRead={_onPassportRead}
      />
    );
  }
};
