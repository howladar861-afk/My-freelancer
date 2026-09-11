// =====================================
// Rakib Freelancer
// REFERRAL COUNT + LIMIT SYSTEM
// =====================================
//
// Level 1 referral verify হলে:
// ✅ referralCount +1
// ✅ limit +1
//
// Level 2 referral verify হলে:
// ✅ referralCount +1
// ❌ limit বাড়বে না
//
// Commission payment:
// referralCommission.js
// =====================================


export function addReferralCounts(
  transaction,
  level1Ref,
  level1User,
  level2Ref,
  level2User
) {

  // =====================================
  // LEVEL 1
  // =====================================

  if (
    level1Ref &&
    level1User
  ) {

    const currentCount =
      Number(
        level1User.referralCount || 0
      );

    const currentLimit =
      Number(
        level1User.limit || 0
      );

    transaction.update(
      level1Ref,
      {

        // Referral Count +1
        referralCount:
          currentCount + 1,

        // ⭐ শুধু Level 1 হলে Limit +1
        limit:
          currentLimit + 1

      }
    );
  }


  // =====================================
  // LEVEL 2
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

        // Level 2-এর Referral Count থাকবে
        referralCount:
          currentCount + 1

        // ⚠️ এখানে limit নেই
        // তাই Level 2-এর Limit বাড়বে না

      }
    );
  }

}
