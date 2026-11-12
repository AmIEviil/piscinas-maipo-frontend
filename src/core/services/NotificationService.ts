import apiClient from "../client/client";
import { NOTIFICATION_API } from "../api/notifications/api";
import type {
  PublicKeyResponse,
  PushSubscriptionPayload,
  PushTestResponse,
} from "../../service/notification.interface";

export const notificationService = {
  getPublicKey: async (): Promise<string | null> => {
    const response = await apiClient.get<PublicKeyResponse>(
      NOTIFICATION_API.publicKey,
    );
    return response.data.publicKey;
  },

  subscribe: async (
    payload: PushSubscriptionPayload,
  ): Promise<{ success: boolean; subscriptionId: string }> => {
    const response = await apiClient.post(NOTIFICATION_API.subscribe, payload);
    return response.data;
  },

  unsubscribe: async (endpoint: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post(NOTIFICATION_API.unsubscribe, {
      endpoint,
    });
    return response.data;
  },

  sendTestNotification: async (
    title?: string,
    body?: string,
  ): Promise<PushTestResponse> => {
    const response = await apiClient.post<PushTestResponse>(
      NOTIFICATION_API.test,
      { title, body },
    );
    return response.data;
  },
};
