
self.addEventListener('push', function(event) {
  if (event.data) {
    const { title, body, data } = event.data.json();
    
    const options = {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // This will open the app when the notification is clicked
  event.waitUntil(
    clients.openWindow('/')
  );
});
