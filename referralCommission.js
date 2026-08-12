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


// =====================================
// PROCESS REFERRAL COMMISSION
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
  // TRANSACTION
  // =====================================

  const result = await runTransaction(db, async (transaction) => {

    // ===================================
    // ALL READS FIRST
    // ===================================

    const requestSnap =
      await transaction.get(requestRef);

    if (!requestSnap.exists()) {
      throw new Error(
        "Verification request পাওয়া যায়নি"
      );
    }

    const requestData =
      requestSnap.data();


    // ===================================
    // ALREADY PAID
    // ===================================

    if (requestData.commissionPaid === true) {

      return;

    }


    // ===================================
    // USER ID
    // ===================================

    const userId =
      requestData.userId;

    if (!userId) {

      throw new Error(
        "Verification request-এ userId নেই"
      );

    }


    // ===================================
    // USER
    // ===================================

    const userRef = doc(
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


    // ===================================
    // COMPANY WALLET
    // ===================================

    const walletSnap =
      await transaction.get(walletRef);


    if (!walletSnap.exists()) {

      throw new Error(
        "Company Wallet document পাওয়া যায়নি"
      );

    }

    const walletData =
      walletSnap.data();


    // ===================================
    // LEVEL 1 REFERRAL CODE
    // ===================================

    const level1Code =
      userData.referredBy;


    if (!level1Code) {

      throw new Error(
        "এই User-এর referredBy নেই"
      );

    }


    // ===================================
    // LEVEL 1 REFERRAL CODE DOCUMENT
    // ===================================

    const level1CodeRef =
      doc(
        db,
        "referralCodes",
        level1Code
      );

    const level1CodeSnap =
      await transaction.get(level1CodeRef);


    if (!level1CodeSnap.exists()) {

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


    // ===================================
    // SELF REFERRAL CHECK
    // ===================================

    if (level1Uid === userId) {

      throw new Error(
        "নিজের Referral Code ব্যবহার করা যাবে না"
      );

    }


    // ========================================
// LEVEL 1 USER
// ========================================

const level1UsersQuery = query(
  collection(db, "users"),
  where("uid", "==", level1Uid)
);

const level1QuerySnap =
  await transaction.get(level1UsersQuery);

if (level1QuerySnap.empty) {
  throw new Error("Level-1 User পাওয়া যায়নি");
}

// আসল users document reference
const level1Ref = level1QuerySnap.docs[0].ref;

// User data
const level1User =
  level1QuerySnap.docs[0].data();


// ========================================
// LEVEL 1 COMMISSION
// ========================================

const level1Amount = 30;

const level1Balance =
  Number(level1User.balance || 0);

const level1ReferralCount =
  Number(level1User.referralCount || 0);


// ========================================
// UPDATE LEVEL 1 USER
// ========================================

transaction.update(
  level1Ref,
  {
    balance: level1Balance + level1Amount,

    referralCount:
      level1ReferralCount + 1
  }
);
    // ===================================
    // LEVEL 2
    // OPTIONAL
    // ===================================

    let level2Ref = null;
    let level2User = null;
    let level2Amount = 0;

    const level2Code =
      level1User.referredBy;


    // ===================================
    // LEVEL 2 EXISTS
    // ===================================

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


        if (
          level2Uid &&
          level2Uid !== userId &&
          level2Uid !== level1Uid
        ) {

          const tempLevel2Ref =
            doc(
              db,
              "users",
              level2Uid
            );


          const level2Snap =
            await transaction.get(
              tempLevel2Ref
            );


          if (level2Snap.exists()) {

            level2Ref =
              tempLevel2Ref;

            level2User =
              level2Snap.data();

            level2Amount = 10;

          }

        }

      }

    }


    // ===================================
    // TOTAL COMMISSION
    // ===================================

    const totalCommission =
      level1Amount +
      level2Amount;


    // ===================================
    // COMPANY BALANCE
    // ===================================

    const companyBalance =
      Number(
        walletData.balance || 0
      );


    if (
      companyBalance <
      totalCommission
    ) {

      throw new Error(
        "Company Wallet-এ পর্যাপ্ত টাকা নেই। প্রয়োজন: ৳" +
        totalCommission
      );

    }


    // ===================================
    // UPDATE COMPANY WALLET
    // ===================================

    transaction.update(
      walletRef,
      {
        balance:
          companyBalance -
          totalCommission
      }
    );


    // ===================================
    // UPDATE LEVEL 1 USER
    // +30
    // REFERRAL COUNT +1
    // ===================================

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


    // ===================================
    // UPDATE LEVEL 2 USER
    // +10
    // REFERRAL COUNT +1
    // ===================================

    if (
      level2Ref &&
      level2User
    ) {

      const level2Balance =
        Number(
          level2User.balance || 0
        );


      const level2ReferralCount =
        Number(
          level2User.referralCount || 0
        );


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

    }


    // ===================================
    // VERIFY USER
    // ===================================

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


    // ===================================
    // MARK COMMISSION PAID
    // ===================================

    transaction.update(
      requestRef,
      {
        verificationStatus:
          "approved",

        verified:
          true,

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
return {
  success: true,
  level1: level1Amount,
  level2: level2Amount,
  companyWallet: -totalCommission
};
  });
  return result;


    // =====================================
  // SUCCESS
  // =====================================

}
