// =====================================
// Rakib Freelancer
// REFERRAL COUNT SYSTEM
// =====================================
// Level 1 referral count +1
// Level 2 referral count +1
//
// NOTE:
// Commission payment (৳30 / ৳10)
// is handled by referralCommission.js
// =====================================
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

    // TOTAL REFERRAL COUNT
    const updateData = {
      referralCount:
        currentCount + 1
    };
    // =====================================
    // APPLY LEVEL 1 REFERRAL DATA
    // =====================================

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
