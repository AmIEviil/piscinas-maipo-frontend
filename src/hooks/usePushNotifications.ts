import { useCallback, useEffect, useState } from "react";
import { notificationService } from "../core/services/NotificationService";
import { urlBase64ToUint8Array } from "../utils/pushUtils";

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  // Check environment & existing subscription
  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    setIsSupported(supported);

    const ua = navigator.userAgent || "";
    const isAppleMobile =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(isAppleMobile);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    if (!supported) {
      setLoading(false);
      return;
    }

    setPermission(Notification.permission);

    const checkSubscription = navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        setIsSubscribed(subscription !== null);
      });

    const timeout = new Promise<void>((resolve) => setTimeout(resolve, 3000));

    Promise.race([checkSubscription, timeout])
      .catch((err) => {
        console.warn("Error checking push subscription:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      throw new Error("Las notificaciones push no están soportadas en este navegador.");
    }

    if (isIOS && !isStandalone) {
      throw new Error(
        "En dispositivos Apple (iOS), debes primero añadir la aplicación a tu Pantalla de Inicio (Compartir > Añadir a pantalla de inicio) para poder activar las notificaciones.",
      );
    }

    setActionLoading(true);
    try {
      // 1. Solicitar permiso al usuario
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        throw new Error(
          perm === "denied"
            ? "Permiso de notificaciones bloqueado. Debes habilitarlo en los ajustes del navegador."
            : "No se otorgaron permisos para las notificaciones.",
        );
      }

      // 2. Obtener clave pública VAPID desde el backend
      const publicKey = await notificationService.getPublicKey();
      if (!publicKey) {
        throw new Error("No se pudo obtener la clave pública VAPID del servidor.");
      }

      // 3. Obtener el registro del Service Worker
      const registration = await navigator.serviceWorker.ready;

      // 4. Suscribir el dispositivo al servicio Push del navegador
      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });

      const jsonSub = subscription.toJSON();
      if (!jsonSub.endpoint || !jsonSub.keys?.p256dh || !jsonSub.keys?.auth) {
        throw new Error("La suscripción no contiene las claves de cifrado requeridas.");
      }

      // 5. Enviar la suscripción al backend
      await notificationService.subscribe({
        endpoint: jsonSub.endpoint,
        keys: {
          p256dh: jsonSub.keys.p256dh,
          auth: jsonSub.keys.auth,
        },
        userAgent: navigator.userAgent,
      });

      setIsSubscribed(true);
      return true;
    } finally {
      setActionLoading(false);
    }
  }, [isSupported, isIOS, isStandalone]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    setActionLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await notificationService.unsubscribe(subscription.endpoint);
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      return true;
    } finally {
      setActionLoading(false);
    }
  }, [isSupported]);

  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    setActionLoading(true);
    try {
      const response = await notificationService.sendTestNotification(
        "Piscinas El Maipo",
        "¡Notificaciones push configuradas y funcionando con éxito!",
      );
      return response.success && response.sent > 0;
    } finally {
      setActionLoading(false);
    }
  }, []);

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    actionLoading,
    isIOS,
    isStandalone,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
}
