// =====================================
// Rakib Freelancer
// REFERRAL COUNT SYSTEM
// Level 1 +1
// Level 2 +1
// =====================================

import {
  doc,
  increment,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// =====================================
// ADD REFERRAL COUNT
// =====================================
// এই function শুধু referral count বাড়াবে
// টাকা/commission এখানে দেওয়া হবে না.
// =====================================

export function addReferralCounts(
  transaction,
  db,
  level1Uid,
  level2Uid = null
) {

  // ===================================
  // LEVEL 1 COUNT
  // ===================================

  if (level1Uid) {

    const level1CountRef = doc(
      db,
      "referralCounts",
      level1Uid
    );

    transaction.set(
      level1CountRef,
      {
        uid: level1Uid,

        count: increment(1),

        updatedAt:
          serverTimestamp()
      },
      {
        merge: true
      }
    );

  }


  // ===================================
  // LEVEL 2 COUNT
  // ===================================

  if (
    level2Uid &&
    level2Uid !== level1Uid
  ) {

    const level2CountRef = doc(
      db,
      "referralCounts",
      level2Uid
    );

    transaction.set(
      level2CountRef,
      {
        uid: level2Uid,

        count: increment(1),

        updatedAt:
          serverTimestamp()
      },
      {
        merge: true
      }
    );

  }

}
