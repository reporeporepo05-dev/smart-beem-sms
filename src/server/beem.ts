import axios from "axios";
import https from "https";
import { Contact, Settings } from "./db.js";

export async function getBeemCredentials() {
  const settings = await Settings.findAll();
  const beemKey =
    settings.find((s) => s.key === "beem_api_key")?.value ||
    process.env.BONGO_LIVE_KEY;
  const beemSecret =
    settings.find((s) => s.key === "beem_api_secret")?.value ||
    process.env.BONGO_LIVE_SECRET;
  const beemSender =
    settings.find((s) => s.key === "beem_sender_id")?.value ||
    process.env.BONGO_SENDER_ID ||
    "";

  return { beemKey, beemSecret, beemSender };
}

export async function checkBeemBalance(): Promise<number> {
  const { beemKey, beemSecret } = await getBeemCredentials();

  if (!beemKey || !beemSecret) return 0;

  try {
    const response = await axios.get(
      "https://apisms.beem.africa/public/v1/vendors/balance",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " +
            Buffer.from(beemKey + ":" + beemSecret).toString("base64"),
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      },
    );
    return response.data?.data?.credit_balance || 0;
  } catch (error) {
    console.error("Failed to get Beem balance", error);
    return 0;
  }
}

export async function sendBeemSMS(
  contacts: Contact[],
  message: string,
  scheduledTime?: string,
) {
  const { beemKey, beemSecret, beemSender } = await getBeemCredentials();
  if (!beemKey || !beemSecret || !beemSender)
    throw new Error("Beem credentials missing");

  // Chunk contacts strictly to 1000 MAX based on Beem docs
  const recipients = contacts.map((c) => ({
    recipient_id: c.id.toString(),
    dest_addr: c.phone.replace("+", ""), // make sure no leading plus sign
  }));

  const payload: any = {
    source_addr: beemSender,
    encoding: 0,
    message: message,
    recipients,
  };

  if (scheduledTime) {
    payload.schedule_time = scheduledTime; // GMT time format "yyyy-mm-dd hh:mm"
  }

  const response = await axios.post(
    "https://apisms.beem.africa/v1/send",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(beemKey + ":" + beemSecret).toString("base64"),
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    },
  );

  return response.data;
}

export async function checkDeliveryReport(destAddr: string, requestId: string) {
  const { beemKey, beemSecret } = await getBeemCredentials();
  if (!beemKey || !beemSecret) return null;

  try {
    const response = await axios.get(
      `https://dlrapi.beem.africa/public/v1/delivery-reports?dest_addr=${destAddr}&request_id=${requestId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " +
            Buffer.from(beemKey + ":" + beemSecret).toString("base64"),
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      },
    );
    return response.data;
  } catch (err) {
    console.error("Failed checking delivery report", err);
    return null;
  }
}
