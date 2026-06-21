import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jwt-jsonwebtoken"; // using generic jsonwebtoken
import { User, Settings, checkDbConnection, sequelize } from "./db.js";

const router = express.Router();
export const SECRET_KEY =
  process.env.JWT_SECRET || "bongo-live-super-secret-123!";

router.get("/status", async (req, res) => {
  try {
    const isDbConnected = await checkDbConnection();
    if (!isDbConnected) {
      return res.json({ configured: false });
    }
    const hasAdmin = (await User.count()) > 0;
    res.json({ configured: hasAdmin });
  } catch (err) {
    res.json({ configured: false });
  }
});

router.post("/setup", async (req, res) => {
  try {
    const { systemName, timezone, username, password, logo, favicon } =
      req.body;

    await sequelize.sync(); // Force table creations

    const usersCount = await User.count();
    if (usersCount > 0) {
      return res.status(400).json({ error: "System already configured" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword });

    await Settings.bulkCreate(
      [
        { key: "systemName", value: systemName },
        { key: "timezone", value: timezone },
        { key: "logo", value: logo || "" },
        { key: "favicon", value: favicon || "" },
        { key: "beem_api_key", value: process.env.BONGO_LIVE_KEY || "" },
        { key: "beem_api_secret", value: process.env.BONGO_LIVE_SECRET || "" },
        { key: "beem_sender_id", value: process.env.BONGO_SENDER_ID || "" },
      ],
      { updateOnDuplicate: ["value"] },
    );

    res.json({ message: "Setup completed successfully" });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // `jsonwebtoken` does not support default exports nicely sometimes, but `import jwt` usually works for jsonwebtoken.
  // Wait, let's use standard default import jwt.
  const jwtLib = require("jsonwebtoken");
  const token = jwtLib.sign(
    { id: user.id, username: user.username },
    SECRET_KEY,
    { expiresIn: "24h" },
  );

  res.json({ token, username: user.username });
});

router.get("/settings", async (req, res) => {
  try {
    const settings = await Settings.findAll();
    const config = settings.reduce(
      (acc, s) => ({ ...acc, [s.key]: s.value }),
      {},
    );
    res.json(config);
  } catch (e) {
    res.json({});
  }
});

export default router;
