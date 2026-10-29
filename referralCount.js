
 // =====================================
 // Rakib Freelancer
 // REFERRAL COUNT + LIMIT + VIDEO UNLOCK
 // + LEADER VERIFICATION COUNT
 // =====================================

export function addReferralCounts(
  transaction,
  level1Ref,
  level1User,
  level2Ref,
  level2User
) {

  // =====================================
  // LEVEL 1 - DIRECT REFERRAL
  // =====================================

  if (level1Ref && level1User) {

    const currentCount =
      Number(level1User.referralCount || 0);

    const currentLimit =
      Number(level1User.limit || 0);

    const currentUnlockCredits =
      Number(level1User.videoUnlockCredits || 0);

    const currentLeaderCount =
      Number(level1User.leaderVerifyCount || 0);

    transaction.update(level1Ref, {

      // Direct verified referral +1
      referralCount:
        currentCount + 1,

      // Existing limit +1
      limit:
        currentLimit + 1,

      // One new video unlock
      videoUnlockCredits:
        currentUnlockCredits + 1,

      // Leader verification count +1
      leaderVerifyCount:
        currentLeaderCount + 1
    });
  }


  // =====================================
  // LEVEL 2 - REFERRAL COUNT ONLY
  // =====================================

  if (level2Ref && level2User) {

    const currentCount =
      Number(level2User.referralCount || 0);

    transaction.update(level2Ref, {

      // Level 2 referral count only
      referralCount:
        currentCount + 1

      // No video unlock or Leader count for Level 2
    });
  }

}
