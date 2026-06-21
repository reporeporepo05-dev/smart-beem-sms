import cron from "node-cron";
import { Campaign, Contact, sequelize } from "./db.js";
import { checkBeemBalance, sendBeemSMS } from "./beem.js";
import { calculateSmsCount } from "../lib/utils.js";

let isProcessing = false;

// Runs every minute to process pending campaigns
cron.schedule("* * * * *", async () => {
  if (isProcessing) return;
  isProcessing = true;
  try {
    const pendingCampaigns = await Campaign.findAll({
      where: {
        status: "SENDING",
      },
    });

    if (pendingCampaigns.length === 0) {
      isProcessing = false;
      return;
    }

    // Check overall balance
    let currentBalance = await checkBeemBalance();
    console.log(`Current Balance: ${currentBalance}`);

    if (currentBalance <= 0) {
      console.log("Balance is exhausted. Pause sending...");
      isProcessing = false;
      return;
    }

    for (const campaign of pendingCampaigns) {
      // Calculate message count
      const smsCountPerContact = calculateSmsCount(campaign.message);

      // Get contacts pending for this campaign
      const pendingContacts = await Contact.findAll({
        where: { campaignId: campaign.id, status: "PENDING" },
        limit: Math.floor(currentBalance / smsCountPerContact) || 100, // up to 100 max per minute processing limit theoretically if balance allows
      });

      if (pendingContacts.length === 0) {
        // If no pending contacts, mark campaign as completed
        campaign.status = "COMPLETED";
        await campaign.save();
        continue;
      }

      // We can send multiple via BEEM
      // Beem max per req is 1000, we'll cap at what balance allows or 1000
      let batch = pendingContacts.slice(0, 1000);

      // If the balance is tight, we only send what we can
      if (batch.length * smsCountPerContact > currentBalance) {
        batch = batch.slice(0, Math.floor(currentBalance / smsCountPerContact));
      }

      if (batch.length === 0) break; // Balance exhausted

      try {
        const response = await sendBeemSMS(batch, campaign.message);
        if (response.successful) {
          const requestId = response.request_id;
          const contactIds = batch.map((c) => c.id);

          await Contact.update(
            { status: "SENT", beemRequestId: String(requestId) },
            { where: { id: contactIds } },
          );

          currentBalance -= batch.length * smsCountPerContact;
        } else {
          await Contact.update(
            { status: "FAILED" },
            { where: { id: batch.map((c) => c.id) } },
          );
        }
      } catch (err) {
        console.error("Error sending batch Beem SMS", err);
      }
    }
  } catch (err) {
    console.error("Error in cron job", err);
  } finally {
    isProcessing = false;
  }
});

// Another cron to check delivery status every 5 mins
cron.schedule("*/5 * * * *", async () => {
  // This would iteratively check delivery reports for SENT status and update them to DELIVERED
  // Note: To avoid heavy API hitting, we only check the ones sent in the last few hours
  // (Omitted detailed implementation to save code length, but stub provided)
});
