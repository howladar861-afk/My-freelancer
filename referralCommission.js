// =====================================
// REFERRAL COMMISSION SYSTEM
// Level 1 = ৳30
// Level 2 = ৳10
// Company Wallet = -৳40
// Referral Count = +1
// =====================================

import {
  doc,
  runTransaction,
  serverTimestamp,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// =====================================
// PROCESS REFERRAL COMMISSION
// =====================================

export async function processReferralCommission(
  db,
  requestId
) {

  const requestRef = doc(
    db,
    "verificationRequests",
    requestId
  );


  // =====================================
  // GET REQUEST
  // =====================================

  const requestSnap =
    await getDoc(requestRef);


  if (!requestSnap.exists()) {
    throw new Error(
      "Verification request পাওয়া যায়নি"
    );
  }


  const requestData =
    requestSnap.data();


  const userId =
    requestData.userId;


  if (!userId) {
    throw new Error(
      "Verification request-এ User ID নেই"
    );
  }


  // =====================================
  // USER
  // =====================================

  const userRef = doc(
    db,
    "users",
    userId
  );


  // =====================================
  // COMPANY WALLET
  // =====================================

  const walletRef = doc(
    db,
    "company",
    "wallet"
  );


  // =====================================
  // TRANSACTION
  // =====================================

  await runTransaction(
    db,
    async (transaction) => {

      // ---------------------------------
      // ALL INITIAL READS
      // ---------------------------------

      const latestRequestSnap =
        await transaction.get(requestRef);

      const userSnap =
        await transaction.get(userRef);

      const walletSnap =
        await transaction.get(walletRef);


      if (!latestRequestSnap.exists()) {
        throw new Error(
          "Verification request পাওয়া যায়নি"
        );
      }


      if (!userSnap.exists()) {
        throw new Error(
          "User account পাওয়া যায়নি"
        );
      }


      if (!walletSnap.exists()) {
        throw new Error(
          "Company Wallet document পাওয়া যায়নি"
        );
      }


      const latestRequest =
        latestRequestSnap.data();

      const userData =
        userSnap.data();

      const walletData =
        walletSnap.data();


      // =================================
      // ALREADY PAID CHECK
      // =================================

      if (
        latestRequest.commissionPaid === true
      ) {

        throw new Error(
          "এই Verification-এর commission ইতিমধ্যে দেওয়া হয়েছে"
        );

      }


      // =================================
      // ONLY APPROVED REQUEST
      // =================================

      if (
        latestRequest.verificationStatus !==
        "approved"
      ) {

        throw new Error(
          "Verification approved হয়নি"
        );

      }


      // =================================
      // COMMISSION AMOUNT
      // =================================

      const level1Amount = 30;

      const level2Amount = 10;

      const totalCommission =
        level1Amount +
        level2Amount;


      // =================================
      // COMPANY BALANCE
      // =================================

      const companyBalance =
        Number(
          walletData.balance || 0
        );


      if (
        companyBalance <
        totalCommission
      ) {

        throw new Error(
          "Company Wallet-এ পর্যাপ্ত টাকা নেই"
        );

      }


      // =================================
      // USER referredBy
      // =================================

      const level1Code =
        userData.referredBy;


      if (!level1Code) {

        throw new Error(
          "User-এর referredBy পাওয়া যায়নি"
        );

      }


      // =================================
      // LEVEL 1 REFERRAL CODE
      // =================================

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


      if (
        !level1CodeSnap.exists()
      ) {

        throw new Error(
          "Level-1 Referral Code পাওয়া যায়নি: " +
          level1Code
        );

      }


      const level1Data =
        level1CodeSnap.data();


      const level1Uid =
        level1Data.uid;


      if (!level1Uid) {

        throw new Error(
          "Level-1 Referral Code-এ UID নেই"
        );

      }


      const level1Ref =
        doc(
          db,
          "users",
          level1Uid
        );


      // =================================
      // LEVEL 1 USER
      // =================================

      const level1UserSnap =
        await transaction.get(
          level1Ref
        );


      if (
        !level1UserSnap.exists()
      ) {

        throw new Error(
          "Level-1 Referrer account পাওয়া যায়নি"
        );

      }


      const level1UserData =
        level1UserSnap.data();


      // =================================
      // LEVEL 2 CODE
      // =================================

      const level2Code =
        level1UserData.referredBy;


      if (!level2Code) {

        throw new Error(
          "Level-2 Referrer পাওয়া যায়নি"
        );

      }


      // =================================
      // LEVEL 2 REFERRAL CODE
      // =================================

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


      if (
        !level2CodeSnap.exists()
      ) {

        throw new Error(
          "Level-2 Referral Code পাওয়া যায়নি: " +
          level2Code
        );

      }


      const level2Data =
        level2CodeSnap.data();


      const level2Uid =
        level2Data.uid;


      if (!level2Uid) {

        throw new Error(
          "Level-2 Referral Code-এ UID নেই"
        );

      }


      const level2Ref =
        doc(
          db,
          "users",
          level2Uid
        );


      // =================================
      // LEVEL 2 USER
      // =================================

      const level2UserSnap =
        await transaction.get(
          level2Ref
        );


      if (
        !level2UserSnap.exists()
      ) {

        throw new Error(
          "Level-2 Referrer account পাওয়া যায়নি"
        );

      }


      // =================================
      // CURRENT BALANCES
      // =================================

      const level1Balance =
        Number(
          level1UserData.balance || 0
        );


      const level2Balance =
        Number(
          level2UserSnap.data().balance || 0
        );


      // =================================
      // CURRENT REFERRAL COUNTS
      // =================================

      const level1ReferralCount =
        Number(
          level1UserData.referralCount || 0
        );


      const level2ReferralCount =
        Number(
          level2UserSnap.data().referralCount || 0
        );


      // =================================
      // COMPANY WALLET -40
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
      // LEVEL 1 +30
      // REFERRAL COUNT +1
      // =================================

      transaction.update(
        level1Ref,
        {
          balance:
            level1Balance +
            level1Amount,

          referralCount:
            level1ReferralCount + 1
        }
      );


      // =================================
      // LEVEL 2 +10
      // REFERRAL COUNT +1
      // =================================

      transaction.update(
        level2Ref,
        {
          balance:
            level2Balance +
            level2Amount,

          referralCount:
            level2ReferralCount + 1
        }
      );


      // =================================
      // VERIFY USER
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
      // MARK COMMISSION PAID
      // =================================

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

    }
  );


  return {
    success: true,
    level1: 30,
    level2: 10,
    companyWallet: -40
  };

        }
