importScripts(
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging-compat.js"
);


const firebaseConfig = {
  apiKey: "AIzaSyBFUKPT7fo6sUofdO09ffiZgjdlaR5evm8",
  authDomain: "rakib-freelancer-9c66b.firebaseapp.com",
  projectId: "rakib-freelancer-9c66b",
  storageBucket: "rakib-freelancer-9c66b.firebasestorage.app",
  messagingSenderId: "541209844482",
  appId: "1:541209844482:web:510568d5226c9bf47ac01b"
};


firebase.initializeApp(firebaseConfig);


const messaging =
  firebase.messaging();


messaging.onBackgroundMessage(
  function(payload) {

    console.log(
      "Background message received:",
      payload
    );


    const notificationTitle =
      payload.notification?.title ||
      "Rakib Freelancer";


    const notificationOptions = {

      body:
        payload.notification?.body ||
        "নতুন Verification Request এসেছে।",

      icon: "/favicon.ico",

      tag:
        "verification-request",

      data:
        payload.data || {}

    };


    self.registration.showNotification(
      notificationTitle,
      notificationOptions
    );

  }
);


self.addEventListener(
  "notificationclick",
  function(event) {

    event.notification.close();


    event.waitUntil(

      clients.matchAll({
        type: "window",
        includeUncontrolled: true
      })

      .then(function(clientList) {

        for (
          const client of clientList
        ) {

          if (
            client.url.includes("admin") &&
            "focus" in client
          ) {

            return client.focus();

          }

        }


        if (clients.openWindow) {

          return clients.openWindow(
            "/"
          );

        }

      })

    );

  }
);
