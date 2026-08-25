// =====================================
// Rakib Freelancer
// REFERRAL COUNT SYSTEM
// =====================================
// Level 1 referral count +1
// Level 2 referral count +1
// Daily Level 1 referral count +1
//
// NOTE:
// Commission payment (৳30 / ৳10)
// is handled by referralCommission.js
// =====================================

import {
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const DAILY_REFERRAL_LIMIT = 4;

export function addReferralCounts(
  transaction,
  level1Ref,
  level1User,
  level2Ref,
  level2User
) {

  // =====================================
  // LEVEL 1 REFERRAL COUNT
  // =====================================

  if (
    level1Ref &&
    level1User
  ) {

    const currentCount =
      Number(
        level1User.referralCount || 0
      );

    // -------------------------------------
    // TOTAL REFERRAL COUNT
    // -------------------------------------

    const updateData = {
      referralCount:
        currentCount + 1
    };

    // =====================================
// DAILY REFERRAL COUNT
// RESET EVERY MIDNIGHT
// =====================================

const dailyCount =
  Number(level1User.dailyReferralCount || 0);

const lastReferralAt =
  level1User.dailyReferralLastAt || null;

let dailyNewCount = 1;
let dailyStartedAt = true;

// আজকের তারিখ বের করা
const now = new Date();

const todayKey =
  now.getFullYear() + "-" +
  String(now.getMonth() + 1).padStart(2, "0") + "-" +
  String(now.getDate()).padStart(2, "0");


// আগের referral-এর তারিখ
let lastReferralDay = null;

if (
  lastReferralAt &&
  typeof lastReferralAt.toDate === "function"
) {

  const lastDate =
    lastReferralAt.toDate();

  lastReferralDay =
    lastDate.getFullYear() + "-" +
    String(lastDate.getMonth() + 1).padStart(2, "0") + "-" +
    String(lastDate.getDate()).padStart(2, "0");
}


// =====================================
// একই দিনে হলে COUNT +1
// নতুন দিন হলে COUNT = 1
// =====================================

if (
  lastReferralDay === todayKey
) {

  if (
    dailyCount >= DAILY_REFERRAL_LIMIT
  ) {

    throw new Error(
      "আজকের ৪টি রেফার ইতিমধ্যে পূর্ণ হয়েছে।"
    );
  }

  dailyNewCount =
    dailyCount + 1;

  dailyStartedAt = false;

} else {

  // নতুন দিন
  dailyNewCount = 1;

  dailyStartedAt = true;
}


// =====================================
// DAILY DATA UPDATE
// =====================================

updateData.dailyReferralCount =
  dailyNewCount;

updateData.dailyReferralLastAt =
  serverTimestamp();


// নতুন দিন / প্রথম referral
if (dailyStartedAt) {

  updateData.dailyReferralStartedAt =
    serverTimestamp();

  updateData.dailyBonusClaimed =
    false;
}


  // =====================================
  // LEVEL 2 REFERRAL COUNT
  // =====================================

  if (
    level2Ref &&
    level2User
  ) {

    const currentCount =
      Number(
        level2User.referralCount || 0
      );

    transaction.update(
      level2Ref,
      {
        referralCount:
          currentCount + 1
      }
    );
  }

}
