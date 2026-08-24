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
const DAILY_REFERRAL_HOURS = 24;

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

    // -------------------------------------
    // DAILY REFERRAL COUNT
    // -------------------------------------

    const dailyCount =
      Number(
        level1User.dailyReferralCount || 0
      );

    const startedAt =
      level1User.dailyReferralStartedAt || null;

    let dailyNewCount = 1;
    let dailyStartedAt = true;

    // 24 hours already passed
    if (startedAt && typeof startedAt.toMillis === "function") {

      const hoursPassed =
        (Date.now() - startedAt.toMillis())
        / (1000 * 60 * 60);

      if (hoursPassed < DAILY_REFERRAL_HOURS) {

        // Daily limit reached
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
      }

    } else if (
      dailyCount > 0
    ) {

      // Existing count but no valid start time
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
    }

    updateData.dailyReferralCount =
      dailyNewCount;

    if (dailyStartedAt) {
      updateData.dailyReferralStartedAt =
        serverTimestamp();

      updateData.dailyReferralLastAt =
        serverTimestamp();

      updateData.dailyBonusClaimed =
        false;
    } else {
      updateData.dailyReferralLastAt =
        serverTimestamp();
    }

    transaction.update(
      level1Ref,
      updateData
    );
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
