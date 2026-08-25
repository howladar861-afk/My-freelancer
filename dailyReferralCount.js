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
// SETTINGS
// =====================================

const DAILY_REFERRAL_LIMIT = 4;
const DAILY_REFERRAL_HOURS = 24;


// =====================================
// RESET IF 24 HOURS EXPIRED
// =====================================

async function resetDailyReferralIfExpired(
  db,
  userRef
) {

  const userSnap =
    await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  const userData =
    userSnap.data();

  const count =
    Number(
      userData.dailyReferralCount || 0
    );

  const startedAt =
    userData.dailyReferralStartedAt;


  // প্রথমবার শুরু
  if (!startedAt) {

    await updateDoc(
      userRef,
      {
        dailyReferralCount: 0,

        dailyReferralStartedAt:
          serverTimestamp(),

        dailyBonusClaimed:
          false
      }
    );

    return 0;
  }


  // Firebase Timestamp
  const startedTime =
    startedAt.toMillis();

  const now =
    Date.now();

  const hoursPassed =
    (now - startedTime) /
    (1000 * 60 * 60);


  // ২৪ ঘণ্টা শেষ হলে reset
  if (
    hoursPassed >=
    DAILY_REFERRAL_HOURS
  ) {

    await updateDoc(
      userRef,
      {
        dailyReferralCount: 0,

        dailyReferralStartedAt:
          serverTimestamp(),

        dailyBonusClaimed:
          false
      }
    );

    return 0;
  }


  return count;
}


// =====================================
// DAILY REFERRAL +1
// =====================================

export async function addDailyReferralCount(
  db,
  referrerUid
) {

  // Referrer UID না থাকলে
  if (!referrerUid) {
    return false;
  }

  // Referrer User
  const userRef = doc(
    db,
    "users",
    referrerUid
  );

  // 24 ঘণ্টা শেষ হলে আগে reset করবে
  const currentCount =
    await resetDailyReferralIfExpired(
      db,
      userRef
    );

  // User পাওয়া না গেলে
  if (currentCount === null) {
    return false;
  }

  // সর্বোচ্চ ৪ জন
  if (
    currentCount >=
    DAILY_REFERRAL_LIMIT
  ) {
    console.log(
      "Daily referral limit already reached:",
      currentCount + "/" + DAILY_REFERRAL_LIMIT
    );

    return false;
  }

  // +1
  const newCount =
    currentCount + 1;

  const updateData = {
    dailyReferralCount:
      newCount,

    dailyReferralLastAt:
      serverTimestamp()
  };

  // প্রথম referral হলে 24 ঘণ্টার timer শুরু
  if (currentCount === 0) {

    updateData.dailyReferralStartedAt =
      serverTimestamp();

    updateData.dailyBonusClaimed =
      false;
  }

  // User update
  await updateDoc(
    userRef,
    updateData
  );

  console.log(
    "Daily Referral Count:",
    newCount + "/" + DAILY_REFERRAL_LIMIT
  );

  return true;
}


// =====================================
// GET DAILY REFERRAL STATUS
// =====================================

export async function getDailyReferralCount(
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


  return {

    count:
      safeCount,

    limit:
      DAILY_REFERRAL_LIMIT,

    completed:
      safeCount >=
      DAILY_REFERRAL_LIMIT
  };
      }
