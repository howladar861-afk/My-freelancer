import {
    getApp,
    getApps
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


// =====================================
// FIREBASE CONFIG
// =====================================

const firebaseConfig = {
    apiKey: "AIzaSyBFUKPT7fo6sUofdO09ffiZgjdlaR5evm8",
    authDomain: "rakib-freelancer-9c66b.firebaseapp.com",
    projectId: "rakib-freelancer-9c66b",
    storageBucket: "rakib-freelancer-9c66b.firebasestorage.app",
    messagingSenderId: "541209844482",
    appId: "1:541209844482:web:510568d5226c9bf47ac01b",
    measurementId: "G-F6QNE0QN5K"
};


// =====================================
// FIREBASE APP
// =====================================

const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);


// =====================================
// TIMER ELEMENT
// =====================================

const timerElement =
    document.getElementById("dailyReferralTimer");


// =====================================
// SHOW TIMER
// =====================================

function startTimer(startedAt) {

    if (!timerElement) {
        console.error(
            "dailyReferralTimer element পাওয়া যায়নি"
        );
        return;
    }


    if (!startedAt) {

        timerElement.textContent =
            "⏳ রেফার শুরু হলে ২৪ ঘণ্টার সময় শুরু হবে";

        return;
    }


    let startTime;


    // Firestore Timestamp
    if (
        typeof startedAt.toMillis === "function"
    ) {

        startTime =
            startedAt.toMillis();

    }

    // Date
    else if (
        startedAt instanceof Date
    ) {

        startTime =
            startedAt.getTime();

    }

    else {

        timerElement.textContent =
            "❌ সময়ের তথ্য সঠিক নয়";

        console.error(
            "Invalid dailyReferralStartedAt:",
            startedAt
        );

        return;
    }


    const endTime =
        startTime +
        (24 * 60 * 60 * 1000);


    function updateTimer() {

        const remaining =
            endTime - Date.now();


        if (remaining <= 0) {

            timerElement.textContent =
                "🔄 ২৪ ঘণ্টার সময় শেষ হয়েছে";

            return;
        }


        const totalSeconds =
            Math.floor(
                remaining / 1000
            );


        const hours =
            Math.floor(
                totalSeconds / 3600
            );


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
}


// =====================================
// AUTH + FIRESTORE
// =====================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            if (timerElement) {

                timerElement.textContent =
                    "🔐 আগে Login করুন";

            }

            return;
        }


        try {

            const userRef =
                doc(
                    db,
                    "users",
                    user.uid
                );


            const userSnap =
                await getDoc(userRef);


            if (!userSnap.exists()) {

                timerElement.textContent =
                    "❌ User তথ্য পাওয়া যায়নি";

                return;
            }


            const userData =
                userSnap.data();


            const startedAt =
                userData.dailyReferralStartedAt;


            startTimer(startedAt);


        } catch (error) {

            console.error(
                "Daily Referral Timer Error:",
                error
            );


            if (timerElement) {

                timerElement.textContent =
                    "❌ Timer Load Error";

            }

        }

    }
);
