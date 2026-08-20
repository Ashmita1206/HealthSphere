/* ==================================================================== */
/*  HealthSphere Service Worker — Web Push Notifications               */
/* ==================================================================== */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push notification event listener
self.addEventListener('push', (event) => {
  let data = {
    title: 'HealthSphere Notification',
    body: 'You have a new update in HealthSphere.',
    icon: '/favicon.ico',
    tag: 'healthsphere-notification',
    route: '/dashboard',
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (_e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.tag || 'healthsphere-notification',
    data: {
      route: data.route || '/dashboard',
    },
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open', title: 'Open HealthSphere' },
      { action: 'close', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const targetRoute = event.notification.data?.route || '/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.navigate(targetRoute);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetRoute);
      }
    }),
  );
});
