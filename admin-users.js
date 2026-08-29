import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyBFUKPT7fo6sUofdO09ffiZgjdlaR5evm8",
  authDomain: "rakib-freelancer-9c66b.firebaseapp.com",
  projectId: "rakib-freelancer-9c66b",
  storageBucket: "rakib-freelancer-9c66b.firebasestorage.app",
  messagingSenderId: "541209844482",
  appId: "1:541209844482:web:510568d5226c9bf47ac01b"
};

const ADMIN_UID = "MwiyoLqCJeYERHAwUKAa17sLwop1";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// Admin Check
onAuthStateChanged(auth, (user) => {

  if (!user) {
    document.body.innerHTML =
      "<h2 style='text-align:center;margin-top:50px;'>❌ Admin Login Required</h2>";
    return;
  }

  if (user.uid !== ADMIN_UID) {
    document.body.innerHTML =
      "<h2 style='text-align:center;margin-top:50px;'>❌ আপনি Admin নন।</h2>";
    return;
  }

  loadUsers();
});


// Users Load
function loadUsers() {

  const pendingUsers =
    document.getElementById("pendingUsers");

  const verifiedUsers =
    document.getElementById("verifiedUsers");

  const usersRef =
    collection(db, "users");

  const usersQuery =
    query(usersRef, orderBy("createdAt", "desc"));

  onSnapshot(
    usersQuery,
    (snapshot) => {

      pendingUsers.innerHTML = "";
      verifiedUsers.innerHTML = "";

      snapshot.forEach((userDoc) => {

        const data = userDoc.data();

        const uid = userDoc.id;

        const card =
          document.createElement("div");

        card.style.cssText = `
          background:#222;
          color:white;
          padding:15px;
          margin:10px 0;
          border-radius:12px;
        `;

        card.innerHTML = `
          <h3>👤 ${data.name || "নাম নেই"}</h3>

          <p>
            <b>Email:</b>
            ${data.email || "নেই"}
          </p>

          <p>
            <b>User ID:</b>
            ${uid}
          </p>

          <p>
            <b>Status:</b>
            ${data.verified ? "✅ Verified" : "⏳ New User"}
          </p>
        `;

        if (data.verified === true) {
          verifiedUsers.appendChild(card);
        } else {
          pendingUsers.appendChild(card);
        }

      });

      if (!pendingUsers.innerHTML) {
        pendingUsers.innerHTML =
          "<p>কোনো নতুন ইউজার নেই।</p>";
      }

      if (!verifiedUsers.innerHTML) {
        verifiedUsers.innerHTML =
          "<p>কোনো Verified Member নেই।</p>";
      }

    },

    (error) => {

      console.error("User Load Error:", error);

      pendingUsers.innerHTML =
        "<p>❌ User Load করা যায়নি।</p>";

      verifiedUsers.innerHTML =
        "<p>❌ User Load করা যায়নি।</p>";
    }
  );
          }
