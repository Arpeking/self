// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

// Browser-safe exports with explicit tree-shaking friendly imports

// Types
export type {
  Adapters,
  ClockAdapter,
  Config,
  CryptoAdapter,
  HttpAdapter,
  LogLevel,
  LoggerAdapter,
  MRZInfo,
  MRZValidation,
  NetworkAdapter,
  Progress,
  ProofHandle,
  ProofRequest,
  RegistrationInput,
  RegistrationStatus,
  SDKEvent,
  SDKEventMap,
  ScanMode,
  ScanOpts,
  ScanResult,
  ScannerAdapter,
  SelfClient,
  StorageAdapter,
  Unsubscribe,
  ValidationInput,
  ValidationResult,
  WsAdapter,
  WsConn,
} from './types/public';

export type { DG1, DG2, NFCScanOptions, ParsedNFCResponse } from './nfc';
export type { MRZScanOptions } from './mrz';
export type { PassportValidationCallbacks } from './validation/document';
export type { QRProofOptions } from './qr';
export type { SdkErrorCategory } from './errors';

export { SCANNER_ERROR_CODES, notImplemented, sdkError } from './errors';
export { SelfClientContext, SelfClientProvider, useSelfClient } from './context';

export { createSelfClient } from './client';

export { defaultConfig } from './config/defaults';

/** @deprecated Use createSelfClient().extractMRZInfo or import from './mrz' */
export { extractMRZInfo, formatDateToYYMMDD, scanMRZ } from './mrz';

export { getAllDocuments, hasAnyValidRegisteredDocument, loadSelectedDocument } from './documents/utils';

// Core functions
export { isPassportDataValid } from './validation/document';

export { mergeConfig } from './config/merge';

export { parseNFCResponse, scanNFC } from './nfc';

export { scanQRProof } from './qr';

export { webScannerShim } from './adapters/web/shims';
