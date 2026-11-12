export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: PushSubscriptionKeys;
  userAgent?: string;
}

export interface PublicKeyResponse {
  publicKey: string | null;
}

export interface PushTestResponse {
  success: boolean;
  sent: number;
  failed: number;
}
