dailyReferral.js

// =====================================
// Rakib Freelancer
// DAILY REFERRAL COUNT SYSTEM
// =====================================

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// =====================================
// DAILY REFERRAL SETTINGS
// =====================================

const DAILY_REFERRAL_LIMIT = 4;
const DAILY_BONUS_HOURS = 24;


// =====================================
// ২৪ ঘণ্টার পুরোনো COUNT RESET
// =====================================

export async function resetDailyReferralIfExpired(db, userRef) {

  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  const userData = userSnap.data();

  const count =
    Number(userData.dailyReferralCount || 0);

  const startedAt =
    userData.dailyReferralStartedAt;

  // আগে কোনো সময় শুরু না হলে
if (!startedAt) {

  await updateDoc(userRef, {
    dailyReferralCount: 0,
    dailyReferralStartedAt: serverTimestamp(),
    dailyBonusClaimed: false
  });

  return 0;
}


  // Firebase Timestamp থেকে milliseconds
  const startedTime =
    startedAt.toMillis();

  const now =
    Date.now();

  const hoursPassed =
    (now - startedTime) / (1000 * 60 * 60);


  // ২৪ ঘণ্টা শেষ
  if (hoursPassed >= DAILY_BONUS_HOURS) {

    await updateDoc(userRef, {

      dailyReferralCount: 0,

      dailyReferralStartedAt:
        serverTimestamp(),

      dailyBonusClaimed:
        false

    });

    return 0;
  }


  return count;
}


// =====================================
// DAILY REFERRAL +1
// =====================================

export async function addDailyReferral(
  db,
  referrerUid
) {

  if (!referrerUid) {
    return false;
  }


  const userRef =
    doc(
      db,
      "users",
      referrerUid
    );


  const currentCount =
    await resetDailyReferralIfExpired(
      db,
      userRef
    );


  if (currentCount === null) {
    return false;
  }


  // ৪টি পূর্ণ হয়ে গেলে আর বাড়বে না
  if (currentCount >= DAILY_REFERRAL_LIMIT) {
    return false;
  }


  const newCount =
  currentCount + 1;

const updateData = {
  dailyReferralCount: newCount,
  dailyReferralLastAt: serverTimestamp()
};

if (currentCount === 0) {
  updateData.dailyReferralStartedAt = serverTimestamp();
  updateData.dailyBonusClaimed = false;
}

await updateDoc(
  userRef,
  updateData
);

return true;
}


// =====================================
// DAILY REFERRAL STATUS
// =====================================

export async function getDailyReferralStatus(
  db,
  userUid
) {

  if (!userUid) {
    return {
      count: 0,
      limit: DAILY_REFERRAL_LIMIT,
      completed: false
    };
  }


  const userRef =
    doc(
      db,
      "users",
      userUid
    );


  const count =
    await resetDailyReferralIfExpired(
      db,
      userRef
    );


  const safeCount =
    Number(count || 0);


  const userSnap =
  await getDoc(userRef);

const userData =
  userSnap.exists()
    ? userSnap.data()
    : {};

const startedAt =
  userData.dailyReferralStartedAt || null;

return {
  count:
    safeCount,

  limit:
    DAILY_REFERRAL_LIMIT,

  completed:
    safeCount >= DAILY_REFERRAL_LIMIT,

  startedAt:
    startedAt
};
    }
