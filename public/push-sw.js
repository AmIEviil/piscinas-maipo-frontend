// Service Worker custom push notifications handler
self.addEventListener('push', (event) => {
  let data = {
    title: 'Piscinas El Maipo',
    body: 'Tienes una nueva notificación.',
    url: '/',
  };

  if (event.data) {
    try {
      data = Object.assign({}, data, event.data.json());
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const title = data.title || 'Piscinas El Maipo';
  const options = {
    body: data.body || '',
    icon: data.icon || '/pwa-192x192.png',
    badge: data.badge || '/pwa-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
      ...(data.data || {}),
    },
    actions: [
      {
        action: 'open',
        title: 'Ver detalles',
      },
      {
        action: 'close',
        title: 'Cerrar',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl =
    (event.notification.data && event.notification.data.url) || '/';
  const fullTargetUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            if ('navigate' in client && client.url !== fullTargetUrl) {
              client.navigate(fullTargetUrl);
            }
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(fullTargetUrl);
        }
      }),
  );
});
