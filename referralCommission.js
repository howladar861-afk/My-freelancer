// =====================================
// Rakib Freelancer
// REFERRAL COMMISSION SYSTEM
// Level 1 = ৳30
// Level 2 = ৳10
// =====================================

import {
  doc,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
  addReferralCounts
} from "./referralCount.js";
// =====================================
// PROCESS VERIFICATION + REFERRAL COMMISSION
// =====================================

export async function processReferralCommission(db, requestId) {

  const requestRef = doc(
    db,
    "verificationRequests",
    requestId
  );

  const walletRef = doc(
    db,
    "company",
    "wallet"
  );

  // =====================================
  // ONE ATOMIC TRANSACTION
  // =====================================

  const result = await runTransaction(
    db,
    async (transaction) => {

      // =================================
      // ALL READS FIRST
      // =================================

      // 1. Verification Request
      const requestSnap =
        await transaction.get(requestRef);

      if (!requestSnap.exists()) {
        throw new Error(
          "Verification request পাওয়া যায়নি"
        );
      }

      const requestData =
        requestSnap.data();

      // Already processed
      if (
        requestData.commissionPaid === true
      ) {
        return {
          success: true,
          alreadyPaid: true,
          level1: 0,
          level2: 0,
          total: 0
        };
      }

      // 2. User ID
      const userId =
        requestData.userId;

      if (!userId) {
        throw new Error(
          "Verification request-এ userId নেই"
        );
      }

      // 3. User
      const userRef =
        doc(
          db,
          "users",
          userId
        );

      const userSnap =
        await transaction.get(userRef);

      if (!userSnap.exists()) {
        throw new Error(
          "User account পাওয়া যায়নি"
        );
      }

      const userData =
        userSnap.data();

      // 4. Company Wallet
      const walletSnap =
        await transaction.get(walletRef);

      if (!walletSnap.exists()) {
        throw new Error(
          "Company Wallet document পাওয়া যায়নি"
        );
      }

      const walletData =
        walletSnap.data();

      // =================================
      // LEVEL 1
      // =================================

      let level1Ref = null;
      let level1User = null;
      let level1Amount = 0;
      let level1Uid = null;

      const level1Code =
        userData.referredBy;

      if (level1Code) {

        const level1CodeRef =
          doc(
            db,
            "referralCodes",
            level1Code
          );

        const level1CodeSnap =
          await transaction.get(
            level1CodeRef
          );

        if (!level1CodeSnap.exists()) {
          throw new Error(
            "Level-1 Referral Code পাওয়া যায়নি: " +
            level1Code
          );
        }

        const level1Data =
          level1CodeSnap.data();

        level1Uid =
          level1Data.uid;

        if (!level1Uid) {
          throw new Error(
            "Level-1 Referral Code-এ UID নেই"
          );
        }

        // Self Referral Check
        if (level1Uid === userId) {
          throw new Error(
            "নিজের Referral Code ব্যবহার করা যাবে না"
          );
        }

        // Find Level 1 User
        level1Ref =
          doc(
            db,
            "users",
            level1Uid
          );

        const level1Snap =
          await transaction.get(
            level1Ref
          );

        if (!level1Snap.exists()) {
          throw new Error(
            "Level-1 User পাওয়া যায়নি"
          );
        }

        level1User =
          level1Snap.data();

        level1Amount = 30;
      }

      // =================================
      // LEVEL 2
      // =================================

      let level2Ref = null;
      let level2User = null;
      let level2Amount = 0;

      // Level 2 code comes from Level 1 user
      const level2Code =
        level1User?.referredBy;

      if (level2Code) {

        const level2CodeRef =
          doc(
            db,
            "referralCodes",
            level2Code
          );

        const level2CodeSnap =
          await transaction.get(
            level2CodeRef
          );

        if (level2CodeSnap.exists()) {

          const level2Data =
            level2CodeSnap.data();

          const level2Uid =
            level2Data.uid;

          // Prevent self / same referrer
          if (
            level2Uid &&
            level2Uid !== userId &&
            level2Uid !== level1Uid
          ) {

            level2Ref =
              doc(
                db,
                "users",
                level2Uid
              );

            const level2Snap =
              await transaction.get(
                level2Ref
              );

            if (level2Snap.exists()) {

              level2User =
                level2Snap.data();

              level2Amount = 10;
            }
          }
        }
      }

      // =================================
      // TOTAL COMMISSION
      // =================================

      const totalCommission =
        level1Amount +
        level2Amount;

      // =================================
      // COMPANY WALLET BALANCE
      // =================================

      const companyBalance =
        Number(
          walletData.balance || 0
        );

      // =================================
      // CHECK COMPANY BALANCE
      // =================================

      if (
        companyBalance <
        totalCommission
      ) {
        throw new Error(
          "Company Wallet-এ পর্যাপ্ত টাকা নেই। প্রয়োজন: ৳" +
          totalCommission
        );
      }

      // =================================
      // NOW ALL READS ARE FINISHED
      // =================================
addReferralCounts(
  transaction,
  level1Ref,
  level1User,
  level2Ref,
  level2User
);
      // =================================
      // UPDATE VERIFICATION USER
      // =================================

      transaction.set(
        userRef,
        {
          verified: true,

          verificationStatus:
            "approved",

          verifiedAt:
            serverTimestamp()
        },
        {
          merge: true
        }
      );

      // =================================
      // UPDATE COMPANY WALLET
      // =================================

      transaction.update(
        walletRef,
        {
          balance:
            companyBalance -
            totalCommission
        }
      );

      // =================================
      // UPDATE LEVEL 1 USER
      // +30
      // =================================

      if (
        level1Ref &&
        level1User &&
        level1Amount > 0
      ) {

        const level1Balance =
          Number(
            level1User.balance || 0
          );

        transaction.set(
  level1Ref,
  {
    balance: level1Balance + level1Amount
  },
  {
    merge: true
  }
);
      }

      // =================================
      // UPDATE LEVEL 2 USER
      // +10
      // =================================

      if (
        level2Ref &&
        level2User &&
        level2Amount > 0
      ) {

        const level2Balance =
          Number(
            level2User.balance || 0
          );

        transaction.set(
  level2Ref,
  {
    balance: level2Balance + level2Amount
  },
  {
    merge: true
  }
);
      }

      // =================================
      // MARK REQUEST AS APPROVED + PAID
      // =================================

      if (!requestRef) {
        throw new Error(
          "requestRef পাওয়া যায়নি"
        );
      }

      transaction.update(
        requestRef,
        {
          verificationStatus:
            "approved",

          verified: true,

          commissionPaid:
            true,

          commissionAmount:
            totalCommission,

          level1Commission:
            level1Amount,

          level2Commission:
            level2Amount,

          commissionPaidAt:
            serverTimestamp(),

          verifiedAt:
            serverTimestamp()
        }
      );

      // =================================
      // RESULT
      // =================================

      return {
  success: true,

  alreadyPaid: false,

  level1:
    level1Amount,

  level2:
    level2Amount,

  total:
    totalCommission,

  level1Uid:
    level1Uid,

  companyWallet:
    -totalCommission
};
    }
  );

  return result;
            }
