import {
  getApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


const app = getApp();
const auth = getAuth(app);
const db = getFirestore(app);

const timerElement =
  document.getElementById("dailyReferralTimer");


if (!timerElement) {
  console.error("dailyReferralTimer element পাওয়া যায়নি!");
} else {

  onAuthStateChanged(auth, async (user) => {

    if (!user) {
      timerElement.textContent =
        "🔒 লগইন করুন";
      return;
    }

    try {

      const userRef =
        doc(db, "users", user.uid);

      const userSnap =
        await getDoc(userRef);

      if (!userSnap.exists()) {

        timerElement.textContent =
          "❌ ইউজারের তথ্য পাওয়া যায়নি";

        return;
      }

      const userData =
        userSnap.data();

      const startedAt =
        userData.dailyReferralStartedAt;


      if (!startedAt) {

        timerElement.textContent =
          "⏳ রেফার শুরু হলে ২৪ ঘণ্টার সময় শুরু হবে";

        return;
      }


      // Firestore Timestamp → milliseconds
      const startTime =
        startedAt.toMillis();

      const endTime =
        startTime + (24 * 60 * 60 * 1000);


      function updateTimer() {

        const now =
          Date.now();

        const remaining =
          endTime - now;


        if (remaining <= 0) {

          timerElement.textContent =
            "✅ ২৪ ঘণ্টার সময় শেষ";

          return;
        }


        const totalSeconds =
          Math.floor(remaining / 1000);

        const hours =
          Math.floor(totalSeconds / 3600);

        const minutes =
          Math.floor(
            (totalSeconds % 3600) / 60
          );

        const seconds =
          totalSeconds % 60;


        timerElement.textContent =
          "⏳ সময় বাকি: " +
          String(hours).padStart(2, "0") +
          ":" +
          String(minutes).padStart(2, "0") +
          ":" +
          String(seconds).padStart(2, "0");
      }


      updateTimer();

      setInterval(
        updateTimer,
        1000
      );

    } catch (error) {

      console.error(
        "Daily Referral Timer Error:",
        error
      );

      timerElement.textContent =
        "❌ Timer Load Error";
    }

  });

}
