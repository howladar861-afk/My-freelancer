import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";


import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  runTransaction
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import {
  processReferralCommission
} from "./referralCommission.js";

// =====================================
// FIREBASE CONFIG
// =====================================

const firebaseConfig = {
  apiKey: "AIzaSyBFUKPT7fo6sUofdO09ffiZgjdlaR5evm8",
  authDomain: "rakib-freelancer-9c66b.firebaseapp.com",
  projectId: "rakib-freelancer-9c66b",
  storageBucket: "rakib-freelancer-9c66b.firebasestorage.app",
  messagingSenderId: "541209844482",
  appId: "1:541209844482:web:510568d5226c9bf47ac01b"
};


// =====================================
// ADMIN UID
// =====================================

const ADMIN_UID = "MwiyoLqCJeYERHAwUKAa17sLwop1";


// =====================================
// FIREBASE START
// =====================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// =====================================
// HTML ELEMENTS
// =====================================

const requestList = document.getElementById("requests");

const logoutBtn = document.getElementById("logoutBtn");


// =====================================
// ESCAPE HTML
// =====================================

function escapeHtml(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// =====================================
// ADMIN LOGIN CHECK
// =====================================

onAuthStateChanged(auth, (user) => {

  if (!user) {

    window.location.href = "index.html";

    return;
  }


  // শুধু নির্দিষ্ট Admin UID প্রবেশ করতে পারবে

  if (user.uid !== ADMIN_UID) {

    alert("❌ আপনি Admin নন!");

    window.location.href = "dashboard.html";

    return;
  }


  // Admin হলে Pending request load
  loadVerificationRequests();
loadCompanyWallet();
  loadJobSubmissions();
  
  });

// =====================================
// LOAD PENDING JOB SUBMISSIONS
// =====================================

function loadJobSubmissions() {

  console.log("🚀 loadJobSubmissions() শুরু হয়েছে");

  const jobSubmissionList =
    document.getElementById("jobSubmissions");

  if (!jobSubmissionList) {

    console.error(
      "❌ jobSubmissions element পাওয়া যায়নি"
    );

    return;
  }

  jobSubmissionList.innerHTML = `
    <div class="message">
      ⏳ Job Submission Loading...
    </div>
  `;

  const submissionsRef =
    collection(db, "jobSubmissions");

  const q = query(
    submissionsRef,
    where("status", "==", "pending")
  );

  console.log("🔥 Firebase query তৈরি হয়েছে");

  onSnapshot(
    q,

    // ================================
    // SUCCESS
    // ================================
    (snapshot) => {

      console.log(
        "✅ Snapshot এসেছে:",
        snapshot.size
      );

      jobSubmissionList.innerHTML = "";

      if (snapshot.empty) {

        jobSubmissionList.innerHTML = `
          <div class="message">
            ✅ কোনো Pending Job Submission নেই।
          </div>
        `;

        return;
      }

      snapshot.forEach((docSnap) => {

        const data = docSnap.data();
        const id = docSnap.id;

        const card =
          document.createElement("div");

        card.className = "request-card";

        card.innerHTML = `
          <h3>
            📋 ${escapeHtml(
              data.jobTitle || "Job"
            )}
          </h3>

          <div class="info">
            👤 User:
            ${escapeHtml(
              data.userEmail || "Email নেই"
            )}
          </div>

          <div class="info">
            🆔 User ID:
            ${escapeHtml(
              data.userId || "নেই"
            )}
          </div>

          <div class="info">
            👤 Follow করা ID / নাম:
            ${escapeHtml(
              data.followedId || "নেই"
            )}
          </div>

          <div class="info">
            💬 Comment:
            ${escapeHtml(
              data.commentText || "নেই"
            )}
          </div>

          <div class="info">
            💰 Payment:
            ৳${Number(
              data.payPerTask || 0
            )}
          </div>

          <div class="status">
            ⏳ Pending
          </div>

          <div class="buttons">

            <button
              class="job-approve"
              data-id="${escapeHtml(id)}">
              ✅ Approve
            </button>

            <button
              class="job-reject"
              data-id="${escapeHtml(id)}">
              ❌ Reject
            </button>

          </div>
        `;

        jobSubmissionList.appendChild(card);

      });

      // ================================
      // APPROVE BUTTON
      // ================================

      document
        .querySelectorAll(".job-approve")
        .forEach((button) => {

          button.onclick = () => {

            approveJobSubmission(
              button.dataset.id
            );

          };

        });

      // ================================
      // REJECT BUTTON
      // ================================

      document
        .querySelectorAll(".job-reject")
        .forEach((button) => {

          button.onclick = () => {

            rejectJobSubmission(
              button.dataset.id
            );

          };

        });

    },

    // ================================
    // FIREBASE ERROR
    // ================================
    (error) => {

  console.error(
    "❌ JOB SUBMISSION ERROR:",
    error.code,
    error.message
  );

  jobSubmissionList.innerHTML = `
    <div class="message"
      style="
        background:#fee2e2;
        color:#991b1b;
        padding:15px;
        border-radius:10px;
      ">

      ❌ Job Submission Load করা যায়নি।

      <br><br>

      <b>Error Code:</b>
      ${escapeHtml(error.code)}

      <br><br>

      <b>Error:</b>
      ${escapeHtml(error.message)}

    </div>
  `;
    }
  );
}
// =====================================
// APPROVE JOB SUBMISSION
// =====================================

async function approveJobSubmission(id) {

if (
!confirm(
"এই কাজটি Approve করবেন?\n\n" +
"Approve করলে Company Wallet থেকে User-এর Balance-এ টাকা যাবে।"
)
) {
return;
}

try {

const submissionRef =  
  doc(db, "jobSubmissions", id);  

await runTransaction(  
  db,  
  async (transaction) => {  

    // Submission  
    const submissionSnap =  
      await transaction.get(  
        submissionRef  
      );  

    if (!submissionSnap.exists()) {  

      throw new Error(  
        "Job Submission পাওয়া যায়নি।"  
      );  

    }  

    const submission =  
      submissionSnap.data();  

    // Double payment বন্ধ  
    if (  
      submission.status !== "pending"  
    ) {  

      throw new Error(  
        "এই Submission ইতিমধ্যে Process করা হয়েছে।"  
      );  

    }  

    const userId =  
      submission.userId;  

    const jobId =  
      submission.jobId;  

    const amount =  
      Number(  
        submission.payPerTask || 0  
      );  

    if (!userId) {  
      throw new Error(  
        "User ID পাওয়া যায়নি।"  
      );  
    }  

    if (!jobId) {  
      throw new Error(  
        "Job ID পাওয়া যায়নি।"  
      );  
    }  

    if (amount <= 0) {  
      throw new Error(  
        "Payment amount সঠিক নয়।"  
      );  
    }  

    // User  
    const userRef =  
      doc(db, "users", userId);  

    const userSnap =  
      await transaction.get(  
        userRef  
      );  

    if (!userSnap.exists()) {  

      throw new Error(  
        "User পাওয়া যায়নি।"  
      );  

    }  

    const userData =  
      userSnap.data();  

    const currentBalance =  
      Number(  
        userData.balance || 0  
      );  

    // Company Wallet  
    const walletRef =  
      doc(db, "company", "wallet");  

    const walletSnap =  
      await transaction.get(  
        walletRef  
      );  

    if (!walletSnap.exists()) {  

      throw new Error(  
        "Company Wallet পাওয়া যায়নি।"  
      );  

    }  

    const walletData =  
      walletSnap.data();  

    const companyBalance =  
      Number(  
        walletData.balance || 0  
      );  

    // Company Wallet-এ পর্যাপ্ত টাকা আছে?  
    if (  
      companyBalance < amount  
    ) {  

      throw new Error(  
        "Company Wallet-এ পর্যাপ্ত টাকা নেই।"  
      );  

    }  

    // Job  
    const jobRef =  
      doc(db, "jobs", jobId);  

    const jobSnap =  
      await transaction.get(  
        jobRef  
      );  

    if (!jobSnap.exists()) {  

      throw new Error(  
        "Job পাওয়া যায়নি।"  
      );  

    }  

    const job =  
      jobSnap.data();  

    const remainingSlots =  
      Number(  
        job.remainingSlots || 0  
      );  

    const remainingBudget =  
      Number(  
        job.remainingBudget || 0  
      );  

    if (  
      remainingSlots <= 0  
    ) {  

      throw new Error(  
        "এই Job-এর সব Slot শেষ।"  
      );  

    }  

    if (  
      remainingBudget < amount  
    ) {  

      throw new Error(  
        "Job Budget-এ পর্যাপ্ত টাকা নেই।"  
      );  

    }  

    // =================================  
    // COMPANY WALLET থেকে টাকা কাটা  
    // =================================  

    transaction.update(  
      walletRef,  
      {  
        balance:  
          companyBalance - amount  
      }  
    );  

    // =================================  
    // USER BALANCE-এ টাকা যোগ  
    // =================================  

    transaction.update(  
      userRef,  
      {  
        balance:  
          currentBalance + amount  
      }  
    );  

    // =================================  
    // JOB SLOT / BUDGET UPDATE  
    // =================================  

    transaction.update(  
      jobRef,  
      {  
        remainingSlots:  
          remainingSlots - 1,  

        remainingBudget:  
          remainingBudget - amount  
      }  
    );  

    // =================================  
    // SUBMISSION APPROVED  
    // =================================  

    transaction.update(  
      submissionRef,  
      {  
        status: "approved",  

        approvedAt:  
          serverTimestamp(),  

        approvedBy:  
          auth.currentUser.uid,  

        paidAmount:  
          amount  
      }  
    );  

  }  
);  

await loadCompanyWallet();  

alert(
  "✅ কাজ Approve হয়েছে!\n\n" +
  "User Balance-এ ৳" +
  amount +
  " টাকা যোগ হয়েছে।"
);

} catch (error) {

console.error(  
  "Job Approve Error:",  
  error  
);  

alert(  
  "❌ Approve করা যায়নি:\n\n" +  
  error.message  
);

}
}
// =====================================
// REJECT JOB SUBMISSION
// =====================================

async function rejectJobSubmission(id) {

if (
!confirm(
"এই কাজটি Reject করবেন?\n\n" +
"Reject করলে User কোনো টাকা পাবে না।"
)
) {
return;
}

try {

const submissionRef =  
  doc(db, "jobSubmissions", id);  

const submissionSnap =  
  await getDoc(submissionRef);  

if (!submissionSnap.exists()) {  

  alert(  
    "❌ Submission পাওয়া যায়নি।"  
  );  

  return;  
}  

const submission =  
  submissionSnap.data();  

if (  
  submission.status !== "pending"  
) {  

  alert(  
    "⚠️ এই Submission ইতিমধ্যে Process করা হয়েছে।"  
  );  

  return;  
}  

await updateDoc(  
  submissionRef,  
  {  

    status: "rejected",  

    rejectedAt:  
      serverTimestamp(),  

    rejectedBy:  
      auth.currentUser.uid  

  }  
);  

alert(  
  "❌ কাজ Reject করা হয়েছে।\n\n" +  
  "User কোনো টাকা পাবে না।"  
);

} catch (error) {

console.error(  
  "Job Reject Error:",  
  error  
);  

alert(  
  "❌ Reject করা যায়নি:\n\n" +  
  error.message  
);

}
}
// =====================================
// LOAD PENDING VERIFICATION
// =====================================

function loadVerificationRequests() {

  const requestsRef = collection(
    db,
    "verificationRequests"
  );

  const q = requestsRef;

  onSnapshot(

    q,

    (snapshot) => {

      requestList.innerHTML = "";


      // কোনো pending request নেই

      if (snapshot.empty) {

        requestList.innerHTML = `
          <div class="message">
            ✅ কোনো Pending Verification নেই।
          </div>
        `;

        return;
      }


      // প্রতিটি request দেখানো

      snapshot.forEach((docSnap) => {

        const data = docSnap.data();

        const id = docSnap.id;


        const request = document.createElement("div");

        request.className = "request-card";


        request.innerHTML = `

          <h3>
            👤 ${escapeHtml(data.name || "নাম নেই")}
          </h3>

          <div class="info">
            📧 Email:
            ${escapeHtml(data.email || "নেই")}
          </div>

          <div class="info">
            📞 Payment Number:
            ${escapeHtml(
              data.verificationPaymentNumber || "নেই"
            )}
          </div>

          <div class="info">
            🧾 Transaction ID:
            ${escapeHtml(
              data.verificationTransactionId || "নেই"
            )}
          </div>

          <div class="info">
            🆔 User ID:
            ${escapeHtml(data.userId || "নেই")}
          </div>

          <div class="status">
            ${escapeHtml(
              data.verificationStatus || "pending"
            )}
          </div>

          <div class="buttons">

            <button
              class="approve"
              data-id="${escapeHtml(id)}">
              ✅ Approve
            </button>

            <button
              class="reject"
              data-id="${escapeHtml(id)}">
              ❌ Reject
            </button>

          </div>

          <button
            class="delete-btn"
            data-id="${escapeHtml(id)}"
            style="
              width:100%;
              margin-top:10px;
              padding:10px;
              border:0;
              border-radius:8px;
              background:#64748b;
              color:#fff;
              font-weight:bold;
              cursor:pointer;
            ">
            🗑️ Delete
          </button>

        `;


        requestList.appendChild(request);

      });


      // =================================
      // APPROVE BUTTON
      // =================================

      document
        .querySelectorAll(".approve")
        .forEach((button) => {

          button.onclick = () => {

            approveRequest(
              button.dataset.id
            );

          };

        });


      // =================================
      // REJECT BUTTON
      // =================================

      document
        .querySelectorAll(".reject")
        .forEach((button) => {

          button.onclick = () => {

            rejectRequest(
              button.dataset.id
            );

          };

        });


      // =================================
      // DELETE BUTTON
      // =================================

      document
        .querySelectorAll(".delete-btn")
        .forEach((button) => {

          button.onclick = () => {

            deleteRequest(
              button.dataset.id
            );

          };

        });

    },

    (error) => {

      console.error(
        "Verification Load Error:",
        error
      );


      requestList.innerHTML = `
        <div class="message">
          ❌ Request Load করা যায়নি।<br><br>
          ${escapeHtml(error.message)}
        </div>
      `;

    }

  );

}
// ========================================
// LOAD COMPANY WALLET
// ========================================

async function loadCompanyWallet() {

  const walletElement =
    document.getElementById("companyWallet");

  walletElement.textContent = "Loading...";

  try {

    const walletRef = doc(
      db,
      "company",
      "wallet"
    );

    const walletSnap =
      await getDoc(walletRef);
console.log("Wallet exists:", walletSnap.exists());
console.log("Wallet data:", walletSnap.data());
    if (!walletSnap.exists()) {

      walletElement.textContent = "৳ 0";

      console.log(
        "Company wallet পাওয়া যায়নি"
      );

      return;
    }

    const walletData =
      walletSnap.data();

    const balance =
      walletData.balance || 0;

    walletElement.textContent =
      "৳ " +
      Number(balance).toLocaleString("en-BD");

  } catch (error) {

    console.error(
      "Company Wallet Load Error:",
      error
    );

    walletElement.textContent =
      "❌ Wallet Error";
  }
}

async function approveRequest(id) {

  if (!confirm("এই Verification Approve করবেন?")) {
    return;
  }

  try {
    const requestRef = doc(
  db,
  "verificationRequests",
  id
);

const requestSnap = await getDoc(requestRef);

if (!requestSnap.exists()) {
  alert("❌ Verification Request পাওয়া যায়নি।");
  return;
}

const userId = requestSnap.data().userId;

if (!userId) {
  alert("❌ User ID পাওয়া যায়নি।");
  return;
}

const result =
  await processReferralCommission(
    db,
    id
  );

await setDoc(
  doc(db, "users", userId),
  {
    verified: true,
    verifiedAt: serverTimestamp()
  },
  {
    merge: true
  }
);


    await loadCompanyWallet();


    if (result.alreadyPaid) {

      alert(
        "⚠️ এই Verification-এর Referral Commission আগেই দেওয়া হয়েছে।"
      );

      return;
    }


    alert(
      "✅ Verification Approved!\n\n" +
      "Level 1: ৳" +
      result.level1 +
      "\n" +
      "Level 2: ৳" +
      result.level2 +
      "\n" +
      "মোট কমিশন: ৳" +
      result.total
    );

  }

  catch (error) {

    console.error(
      "Approve Error:",
      error
    );


    alert(
      "❌ Approve করা যায়নি:\n\n" +
      error.message
    );

  }

}
// =====================================
// REJECT REQUEST
// =====================================

async function rejectRequest(id) {

  if (
    !confirm(
      "এই Verification Reject করবেন?"
    )
  ) {

    return;
  }


  try {

    const requestRef = doc(
      db,
      "verificationRequests",
      id
    );


    await updateDoc(
      requestRef,
      {

        verificationStatus:
          "rejected",

        verified: false,

        rejectedAt:
          serverTimestamp()

      }
    );


    alert(
      "❌ Verification Rejected!"
    );

  }

  catch (error) {

    console.error(
      "Reject Error:",
      error
    );


    alert(
      "❌ Reject করা যায়নি:\n\n" +
      error.message
    );

  }

}


// =====================================
// DELETE REQUEST
// =====================================

async function deleteRequest(id) {

  if (
    !confirm(
      "এই Request Delete করবেন?"
    )
  ) {

    return;
  }


  try {

    const requestRef = doc(
      db,
      "verificationRequests",
      id
    );


    await deleteDoc(
      requestRef
    );


    alert(
      "🗑️ Request Deleted!"
    );

  }

  catch (error) {

    console.error(
      "Delete Error:",
      error
    );


    alert(
      "❌ Delete করা যায়নি:\n\n" +
      error.message
    );

  }

}


// =====================================
// LOGOUT
// =====================================

logoutBtn.onclick = async () => {

  try {

    await signOut(auth);

    window.location.href =
      "index.html";

  }

  catch (error) {

    console.error(
      "Logout Error:",
      error
    );

    alert(
      "❌ Logout করা যায়নি।"
    );

  }

};
