import express from "express";
import multer from "multer";
import * as xlsx from "xlsx";
import { parse as parseCsv } from "csv-parser"; // Note: csv-parser is a stream. better to use simple string processing or convert through xlsx for csv
import fs from "fs";
import { Campaign, Contact } from "./db.js";
import { checkBeemBalance } from "./beem.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Middleware to check auth
router.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    const jwtLib = require("jsonwebtoken");
    jwtLib.verify(
      token,
      process.env.JWT_SECRET || "bongo-live-super-secret-123!",
      (err: any, user: any) => {
        if (err) return res.sendStatus(403);
        (req as any).user = user;
        next();
      },
    );
  } else {
    res.sendStatus(401);
  }
});

router.get("/balance", async (req, res) => {
  const balance = await checkBeemBalance();
  res.json({ balance });
});

router.get("/campaigns", async (req, res) => {
  const campaigns = await Campaign.findAll({ order: [["createdAt", "DESC"]] });
  res.json(campaigns);
});

router.post("/campaigns", upload.single("file"), async (req, res) => {
  try {
    const { name, message, scheduledTime } = req.body;
    const file = req.file;

    if (!name || !message || !file) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const campaign = await Campaign.create({
      name,
      message,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
      status: scheduledTime ? "PENDING" : "SENDING",
    });

    // Parse excel / csv
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const rows: any[] = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const contacts = rows.map((r: any) => {
      // Find a valid phone column (checking keys like phone, phone_number, mobile, or just standardizing)
      const keys = Object.keys(r);
      const phoneKey =
        keys.find(
          (k) =>
            k.toLowerCase().includes("phone") ||
            k.toLowerCase().includes("mobile"),
        ) || keys[0];
      const nameKey = keys.find((k) => k.toLowerCase().includes("name"));

      let phoneStr = String(r[phoneKey]).replace(/\D/g, "");
      // Simple normalization for Tanzania example (Beem usually takes 255...)
      if (phoneStr.startsWith("0")) phoneStr = "255" + phoneStr.slice(1);

      return {
        phone: phoneStr,
        name: nameKey ? r[nameKey] : "",
        campaignId: campaign.id,
      };
    });

    await Contact.bulkCreate(contacts);
    fs.unlinkSync(file.path);

    res.json({ success: true, count: contacts.length, campaign });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: String(err) });
  }
});

router.get("/campaigns/:id", async (req, res) => {
  const campaign = await Campaign.findByPk(req.params.id);
  if (!campaign) return res.status(404).json({ error: "Not found" });
  const contacts = await Contact.findAll({
    where: { campaignId: campaign.id },
  });

  // summarize states
  const summary = {
    pending: 0,
    sent: 0,
    failed: 0,
    delivered: 0,
    undelivered: 0,
    total: contacts.length,
  };
  contacts.forEach(
    (c) => summary[c.status.toLowerCase() as keyof typeof summary]++,
  );

  res.json({ campaign, contacts, summary });
});

export default router;
