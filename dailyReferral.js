// =====================================
// Rakib Freelancer
// DAILY REFERRAL BONUS SYSTEM
// =====================================
//
// নিয়ম:
// 1. একজন User-এর Direct verified referral হলে count +1
// 2. সর্বোচ্চ 4টি referral
// 3. 4টি পূর্ণ হলে bonus eligible
// 4. Bonus একবার claim করা যাবে
// 5. 24 ঘণ্টা পর নতুন cycle শুরু হবে
//
// Firestore:
// dailyReferral/{uid}
// =====================================

import {
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// =====================================
// SETTINGS
// =====================================

export const DAILY_REFERRAL_LIMIT = 4;

export const DAILY_BONUS_AMOUNT = 20;


// =====================================
// DAILY REFERRAL DOCUMENT
// =====================================

export function getDailyReferralRef(db, uid) {

  if (!db) {
    throw new Error("Firestore DB পাওয়া যায়নি");
  }

  if (!uid) {
    throw new Error("User UID পাওয়া যায়নি");
  }

  return doc(
    db,
    "dailyReferral",
    uid
  );
}


// =====================================
// ADD VERIFIED DIRECT REFERRAL
// =====================================
//
// এই function verification approve হওয়ার সময়
// Direct referrer-এর count +1 করবে.
//
// IMPORTANT:
// transaction.get() এই function-এর ভিতরে করা হবে না।
// কারণ referralCommission.js-এ সব READ আগে করতে হয়।
// =====================================

export function addDailyReferral(
  transaction,
  dailyReferralRef,
  dailyReferralData,
  now = Date.now()
) {

  if (!transaction) {
    throw new Error(
      "Firestore transaction পাওয়া যায়নি"
    );
  }

  if (!dailyReferralRef) {
    throw new Error(
      "Daily referral reference পাওয়া যায়নি"
    );
  }


  // =====================================
  // EXISTING DATA
  // =====================================

  const data =
    dailyReferralData || {};

  let count =
    Number(data.count || 0);

  const limit =
    Number(
      data.limit ||
      DAILY_REFERRAL_LIMIT
    );


  // =====================================
  // CHECK 24 HOUR CYCLE
  // =====================================

  let startedAtMs = 0;

  if (data.startedAt) {

    if (
      typeof data.startedAt.toMillis ===
      "function"
    ) {

      startedAtMs =
        data.startedAt.toMillis();

    } else if (
      data.startedAt.seconds
    ) {

      startedAtMs =
        Number(
          data.startedAt.seconds
        ) * 1000;

    } else if (
      typeof data.startedAt ===
      "number"
    ) {

      startedAtMs =
        data.startedAt;
    }
  }


  // =====================================
  // NEW DAILY CYCLE
  // =====================================

  const cycleExpired =
    !startedAtMs ||
    (now - startedAtMs >=
      24 * 60 * 60 * 1000);


  if (cycleExpired) {

    transaction.set(
      dailyReferralRef,
      {

        count: 1,

        limit:
          DAILY_REFERRAL_LIMIT,

        completed:
          DAILY_REFERRAL_LIMIT <= 1,

        bonusClaimed:
          false,

        startedAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp()

      },
      {
        merge: true
      }
    );

    return {
      count: 1,

      limit:
        DAILY_REFERRAL_LIMIT,

      completed:
        DAILY_REFERRAL_LIMIT <= 1,

      bonusClaimed: false,

      newCycle: true
    };
  }


  // =====================================
  // LIMIT ALREADY REACHED
  // =====================================

  if (count >= limit) {

    return {
      count: limit,

      limit: limit,

      completed: true,

      bonusClaimed:
        data.bonusClaimed === true,

      newCycle: false
    };
  }


  // =====================================
  // ADD +1
  // =====================================

  const newCount =
    Math.min(
      count + 1,
      limit
    );

  const completed =
    newCount >= limit;


  transaction.set(
    dailyReferralRef,
    {

      count:
        newCount,

      limit:
        limit,

      completed:
        completed,

      // আগে claim করা থাকলে সেটা থাকবে
      bonusClaimed:
        data.bonusClaimed === true,

      updatedAt:
        serverTimestamp()

    },
    {
      merge: true
    }
  );


  return {

    count:
      newCount,

    limit:
      limit,

    completed:
      completed,

    bonusClaimed:
      data.bonusClaimed === true,

    newCycle: false
  };
}


// =====================================
// CHECK BONUS ELIGIBILITY
// =====================================

export function canClaimDailyBonus(
  dailyReferralData
) {

  if (!dailyReferralData) {
    return false;
  }

  const count =
    Number(
      dailyReferralData.count || 0
    );

  const limit =
    Number(
      dailyReferralData.limit ||
      DAILY_REFERRAL_LIMIT
    );

  const completed =
    dailyReferralData.completed === true ||
    count >= limit;

  const alreadyClaimed =
    dailyReferralData.bonusClaimed === true;


  return (
    completed &&
    !alreadyClaimed
  );
}


// =====================================
// CLAIM DAILY BONUS
// =====================================
//
// 4টি verified referral পূর্ণ হওয়ার পর
// "বোনাস নিন" চাপলে এই function ব্যবহার হবে।
//
// এখানে:
// balance + ৳20
// bonusClaimed = true
//
// একই bonus দ্বিতীয়বার নেওয়া যাবে না।
// =====================================

export function claimDailyBonus(
  transaction,
  userRef,
  userData,
  dailyReferralRef,
  dailyReferralData
) {

  if (!transaction) {
    throw new Error(
      "Firestore transaction পাওয়া যায়নি"
    );
  }

  if (!userRef) {
    throw new Error(
      "User reference পাওয়া যায়নি"
    );
  }

  if (!dailyReferralRef) {
    throw new Error(
      "Daily referral reference পাওয়া যায়নি"
    );
  }


  // =====================================
  // CHECK ELIGIBILITY
  // =====================================

  if (
    !canClaimDailyBonus(
      dailyReferralData
    )
  ) {

    throw new Error(
      "Daily bonus claim করার যোগ্যতা পূর্ণ হয়নি"
    );
  }


  // =====================================
  // CURRENT BALANCE
  // =====================================

  const currentBalance =
    Number(
      userData?.balance || 0
    );


  // =====================================
  // ADD ৳20
  // =====================================

  const newBalance =
    currentBalance +
    DAILY_BONUS_AMOUNT;


  transaction.set(
    userRef,
    {

      balance:
        newBalance

    },
    {
      merge: true
    }
  );


  // =====================================
  // MARK BONUS CLAIMED
  // =====================================

  transaction.set(
    dailyReferralRef,
    {

      bonusClaimed:
        true,

      bonusAmount:
        DAILY_BONUS_AMOUNT,

      bonusClaimedAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp()

    },
    {
      merge: true
    }
  );


  // =====================================
  // RESULT
  // =====================================

  return {

    success: true,

    amount:
      DAILY_BONUS_AMOUNT,

    newBalance:
      newBalance

  };
      }
