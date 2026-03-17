self.addEventListener('push', (event) => {
  const data = event.data.json();
  const title = data.title;
  const options = {
    body: data.body,
    icon: '/favicon.ico',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientsArr => {
      const hadWindowToFocus = clientsArr.some(client => {
        if (client.url === '/' && 'focus' in client) {
          client.focus();
          return true;
        }
        return false;
      });

      if (!hadWindowToFocus) clients.openWindow('/');
      return;
    })
  );

  // Send message to app to play sound
  clients.matchAll({ type: 'window' }).then(clients => {
    clients.forEach(client => client.postMessage({ type: 'PLAY_ALARM' }));
  });
});

