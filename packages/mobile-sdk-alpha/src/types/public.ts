// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import type { DocumentCatalog, PassportData } from '@selfxyz/common/utils/types';

export type { PassportValidationCallbacks } from '../validation/document';
export type { DocumentCatalog, PassportData };
export interface Config {
  endpoints?: { api?: string; teeWs?: string; artifactsCdn?: string };
  timeouts?: {
    httpMs?: number;
    wsMs?: number;
    scanMs?: number;
    proofMs?: number;
  };
  features?: Record<string, boolean>;
  tlsPinning?: { enabled: boolean; pins?: string[] };
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

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Progress {
  step: string;
  percent?: number;
}
export interface Adapters {
  storage?: StorageAdapter;
  scanner: ScannerAdapter;
  crypto: CryptoAdapter;
  network: NetworkAdapter;
  clock?: ClockAdapter;
  logger?: LoggerAdapter;
  analytics?: AnalyticsAdapter;
  auth: AuthAdapter;
  documents: DocumentsAdapter;
}

export interface ProofHandle {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  result: () => Promise<{ ok: boolean; reason?: string }>;
  cancel: () => void;
}
export interface LoggerAdapter {
  log(level: LogLevel, message: string, fields?: Record<string, unknown>): void;
}

export interface ProofRequest {
  type: 'register' | 'dsc' | 'disclose';
  payload: unknown;
}
export interface NetworkAdapter {
  http: HttpAdapter;
  ws: WsAdapter;
}

export interface RegistrationInput {
  docId?: string;
  scan: ScanResult;
}

export interface RegistrationStatus {
  registered: boolean;
  reason?: string;
}

export interface SDKEventMap {
  progress: Progress;
  state: string;
  error: Error;
}
export type SDKEvent = keyof SDKEventMap;

export type ScanMode = 'mrz' | 'nfc' | 'qr';

export type ScanOpts =
  | { mode: 'mrz' }
  | {
      mode: 'nfc';
      passportNumber: string;
      dateOfBirth: string;
      dateOfExpiry: string;
      canNumber?: string;
      skipPACE?: boolean;
      skipCA?: boolean;
      extendedMode?: boolean;
      usePacePolling?: boolean;
    }
  | { mode: 'qr' };

export type ScanResultNFC = {
  mode: 'nfc';
  passportData: PassportData;
};

export type ScanResultMRZ = {
  mode: 'mrz';
  mrzInfo: MRZInfo;
};

export type ScanResultQR = {
  mode: 'qr';
  data: string;
};

export type ScanResult = ScanResultMRZ | ScanResultNFC | ScanResultQR;

export interface ScannerAdapter {
  scan(opts: ScanOpts & { signal?: AbortSignal }): Promise<ScanResult>;
}

export interface DocumentsAdapter {
  loadDocumentCatalog(): Promise<DocumentCatalog>;
  loadDocumentById(id: string): Promise<PassportData | null>;
  saveDocumentCatalog(catalog: DocumentCatalog): Promise<void>;
}

export interface SelfClient {
  scanDocument(opts: ScanOpts & { signal?: AbortSignal }): Promise<ScanResult>;
  validateDocument(input: ValidationInput): Promise<ValidationResult>;
  checkRegistration(input: RegistrationInput): Promise<RegistrationStatus>;
  registerDocument(input: RegistrationInput): Promise<RegistrationStatus>;
  generateProof(
    req: ProofRequest,
    opts?: {
      signal?: AbortSignal;
      onProgress?: (p: Progress) => void;
      timeoutMs?: number;
    },
  ): Promise<ProofHandle>;
  extractMRZInfo(mrz: string): MRZInfo;
  trackEvent(event: string, payload?: TrackEventParams): void;
  getPrivateKey(): Promise<string | null>;
  hasPrivateKey(): Promise<boolean>;
  on<E extends SDKEvent>(event: E, cb: (payload: SDKEventMap[E]) => void): Unsubscribe;
  emit<E extends SDKEvent>(event: E, payload: SDKEventMap[E]): void;

  loadDocumentCatalog(): Promise<DocumentCatalog>;
  loadDocumentById(id: string): Promise<PassportData | null>;
  saveDocumentCatalog(catalog: DocumentCatalog): Promise<void>;
}
export type Unsubscribe = () => void;
export interface StorageAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}
export interface ValidationInput {
  scan: ScanResult;
}
export interface ValidationResult {
  ok: boolean;
  reason?: string;
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
