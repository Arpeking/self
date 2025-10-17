// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import type { create } from 'zustand';

import type { DocumentCatalog, IDDocument, PassportData } from '@selfxyz/common';

import type { ProofContext } from '../proving/internal/logging';
import type { ProvingState } from '../proving/provingMachine';
import type { MRZState } from '../stores/mrzStore';
import type { ProtocolState } from '../stores/protocolStore';
import type { SelfAppState } from '../stores/selfAppStore';
import type { SDKEvent, SDKEventMap } from './events';

export type { PassportValidationCallbacks } from '../validation/document';
export type { DocumentCatalog, IDDocument, PassportData };
export interface Config {
  timeouts?: {
    scanMs?: number;
  };
  features?: Record<string, boolean>;
}
export interface CryptoAdapter {
  hash(input: Uint8Array, algo?: 'sha256'): Promise<Uint8Array>;
  sign(data: Uint8Array, keyRef: string): Promise<Uint8Array>;
}

export interface HttpAdapter {
  fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
}
export interface MRZInfo {
  documentNumber: string;
  dateOfBirth: string;
  dateOfExpiry: string;
  issuingCountry: string;
  documentType: string;
  validation?: MRZValidation; //TODO - not available in IOS currentlt
}

/** * Generic reasons:
 * - network_error: Network connectivity issues
 * - user_cancelled: User cancelled the operation
 * - permission_denied: Permission not granted
 * - invalid_input: Invalid user input
 * - timeout: Operation timed out
 * - unknown_error: Unspecified error * * Auth specific:
 * - invalid_credentials: Invalid login credentials
 * - biometric_unavailable: Biometric authentication unavailable
 * - invalid_mnemonic: Invalid mnemonic phrase * * Passport specific:
 * - invalid_format: Invalid passport format
 * - expired_passport: Passport is expired
 * - scan_error: Error during scanning
 * - nfc_error: NFC read error * * Proof specific:
 * - verification_failed: Proof verification failed
 * - session_expired: Session expired
 * - missing_fields: Required fields missing * * Backup specific:
 * - backup_not_found: Backup not found
 * - cloud_service_unavailable: Cloud service unavailable
 * */
export interface TrackEventParams {
  reason?: string | null;
  duration_seconds?: number;
  attempt_count?: number;
  [key: string]: unknown;
}

export interface AnalyticsAdapter {
  trackEvent(event: string, payload?: TrackEventParams): void;
}

export interface AuthAdapter {
  /**
   * Returns the hex-encoded private key.
   * This key should only be used for self and not other crypto operations or signing.
   */
  getPrivateKey(): Promise<string | null>;
}

export interface ClockAdapter {
  now(): number;
  sleep(ms: number, signal?: AbortSignal): Promise<void>;
}

export interface MRZValidation {
  format: boolean;
  passportNumberChecksum: boolean;
  dateOfBirthChecksum: boolean;
  dateOfExpiryChecksum: boolean;
  compositeChecksum: boolean;
  overall: boolean;
}

export type LogLevel = 'info' | 'warn' | 'error';

export interface Progress {
  step: string;
  percent?: number;
}
export interface Adapters {
  storage?: StorageAdapter;
  scanner: NFCScannerAdapter;
  crypto: CryptoAdapter;
  network: NetworkAdapter;
  clock?: ClockAdapter;
  logger?: LoggerAdapter;
  analytics?: AnalyticsAdapter;
  auth: AuthAdapter;
  documents: DocumentsAdapter;
}

export interface LoggerAdapter {
  log(level: LogLevel, message: string, fields?: Record<string, unknown>): void;
}

export interface NetworkAdapter {
  http: HttpAdapter;
  ws: WsAdapter;
}

export type NFCScanOpts = {
  passportNumber: string;
  dateOfBirth: string;
  dateOfExpiry: string;
  canNumber?: string;
  skipPACE?: boolean;
  skipCA?: boolean;
  extendedMode?: boolean;
  usePacePolling?: boolean;
  sessionId: string;
  useCan?: boolean;
  userId?: string;
};

export type NFCScanResult = {
  passportData: PassportData;
};
export interface NFCScannerAdapter {
  scan(opts: NFCScanOpts & { signal?: AbortSignal }): Promise<NFCScanResult>;
}

export interface DocumentsAdapter {
  loadDocumentCatalog(): Promise<DocumentCatalog>;
  saveDocumentCatalog(catalog: DocumentCatalog): Promise<void>;

  loadDocumentById(id: string): Promise<IDDocument | null>;
  saveDocument(id: string, passportData: IDDocument): Promise<void>;

  deleteDocument(id: string): Promise<void>;
}

export interface SelfClient {
  scanNFC(opts: NFCScanOpts & { signal?: AbortSignal }): Promise<NFCScanResult>;
  extractMRZInfo(mrz: string): MRZInfo;
  trackEvent(event: string, payload?: TrackEventParams): void;
  getPrivateKey(): Promise<string | null>;
  hasPrivateKey(): Promise<boolean>;
  on<E extends SDKEvent>(event: E, cb: (payload?: SDKEventMap[E]) => void): Unsubscribe;
  emit<E extends SDKEvent>(event: E, payload?: SDKEventMap[E]): void;
  logProofEvent(level: LogLevel, message: string, context: ProofContext, details?: Record<string, any>): void;
  loadDocumentCatalog(): Promise<DocumentCatalog>;
  saveDocumentCatalog(catalog: DocumentCatalog): Promise<void>;
  loadDocumentById(id: string): Promise<IDDocument | null>;
  saveDocument(id: string, passportData: IDDocument): Promise<void>;
  deleteDocument(id: string): Promise<void>;

  getProvingState: () => ProvingState;
  getSelfAppState: () => SelfAppState;
  getProtocolState: () => ProtocolState;
  getMRZState: () => MRZState;

  useProvingStore: ReturnType<typeof create<ProvingState, []>>;
  useSelfAppStore: ReturnType<typeof create<SelfAppState, []>>;
  useProtocolStore: ReturnType<typeof create<ProtocolState, []>>;
  useMRZStore: ReturnType<typeof create<MRZState, []>>;
}
export type Unsubscribe = () => void;
export interface StorageAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}
export interface WsAdapter {
  connect(url: string, opts?: { signal?: AbortSignal; headers?: Record<string, string> }): WsConn;
}

export interface WsConn {
  send: (data: string | ArrayBufferView | ArrayBuffer) => void;
  close: () => void;
  onMessage: (cb: (data: any) => void) => void;
  onError: (cb: (e: any) => void) => void;
  onClose: (cb: () => void) => void;
}
