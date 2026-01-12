const express = require("express");
const cors = require("cors");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const TELECMI_BASE_URL =
  process.env.TELECMI_BASE_URL || "https://rest.telecmi.com/v2";
const TELECMI_APP_ID = process.env.TELECMI_APP_ID || "";
const TELECMI_APP_SECRET = process.env.TELECMI_APP_SECRET || "";

// Simple in-memory store for live calls (from webhooks)
const liveCalls = new Map();

// In-memory list of users created via this app (for display/delete convenience)
const createdUsers = [];

function ensureAppCreds(appid, secret) {
  if (!appid || !secret) {
    throw new Error("appid or secret missing for TeleCMI CHUB REST API");
  }
}

function appBody(extra = {}) {
  const appid = Number(TELECMI_APP_ID);
  const secret = TELECMI_APP_SECRET;
  ensureAppCreds(appid, secret);
  return { appid, secret, ...extra };
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// --- Auth / Admin ---
app.post("/api/admin/token", async (req, res) => {
  try {
    const appid = req.body.appid || TELECMI_APP_ID;
    const secret = req.body.appsecret || req.body.secret || TELECMI_APP_SECRET;

    ensureAppCreds(appid, secret);

    const url = `${TELECMI_BASE_URL}/account/balance`;
    const response = await axios.post(url, { appid, secret });

    res.json({
      ok: true,
      appid,
      balance: response.data,
    });
  } catch (err) {
    console.error("Error validating app credentials", err.message);
    res.status(500).json({
      error: "Failed to validate app credentials",
      details: err.message,
    });
  }
});

// --- Users ---

// List users
app.post("/api/users/list", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.body;

    const url = `${TELECMI_BASE_URL}/user/list`;

    const response = await axios.post(
      url,
      appBody({
        page: Number(page),
        limit: Number(limit),
      })
    );

    // ✅ Axios always puts payload in response.data
    return res.status(200).json(response.data);
  } catch (err) {
    console.error("User list error:", {
      message: err.message,
      data: err.response?.data,
      status: err.response?.status,
    });

    return res.status(err.response?.status || 500).json({
      error: "Failed to list users",
      details: err.response?.data || err.message,
    });
  }
});

// Create user
app.post("/api/users/add", async (req, res) => {
  try {
    const {
      extension,
      name,
      phone_number,
      password,
      start_time,
      end_time,
      sms_alert = false,
    } = req.body;

    const url = `${TELECMI_BASE_URL}/user/add`;
    const response = await axios.post(
      url,
      appBody({
        extension: Number(extension),
        name,
        phone_number,
        password,
        start_time: Number(start_time),
        end_time: Number(end_time),
        sms_alert,
      })
    );

    if (response.data.agent) {
      createdUsers.push(response.data.agent);
    }

    res.json(response.data);
  } catch (err) {
    console.error("Error creating user", err.response.data.msg.body);
    res.status(500).json({
      error: "Failed to create user",
      details: JSON.stringify(err.response.data.msg.body),
    });
  }
});

// Update user
app.post("/api/users/update", async (req, res) => {
  try {
    const {
      id,
      name,
      phone_number,
      password,
      start_time,
      end_time,
      sms_alert,
    } = req.body;

    const url = `${TELECMI_BASE_URL}/user/update`;
    const response = await axios.post(
      url,
      appBody({
        id,
        name,
        phone_number,
        password,
        start_time,
        end_time,
        sms_alert,
      })
    );

    res.json(response.data);
  } catch (err) {
    console.error("Error updating user", err.message);
    res.status(500).json({
      error: "Failed to update user",
      details: JSON.stringify(err.response.data.msg.body),
    });
  }
});

// Delete user
app.post("/api/users/delete", async (req, res) => {
  try {
    const { id } = req.body;

    const url = `${TELECMI_BASE_URL}/user/remove`;
    const response = await axios.post(url, appBody({ id }));

    // Remove from createdUsers
    const index = createdUsers.findIndex((u) => u.agent_id === id);
    if (index > -1) {
      createdUsers.splice(index, 1);
    }

    res.json(response.data);
  } catch (err) {
    console.error("Error deleting user", err.response.data.msg.body);
    res.status(500).json({
      error: "Failed to delete user",
      details: JSON.stringify(err.response.data.msg.body),
    });
  }
});

// --- User login ---

// Login user
app.post("/api/users/login", async (req, res) => {
  try {
    const { id, password } = req.body;

    const url = `${TELECMI_BASE_URL}/user/login`;
    const response = await axios.post(url, { id, password });

    res.json(response.data);
  } catch (err) {
    console.error("Error logging in user", err.message);
    res.status(500).json({
      error: "Failed to login user",
      details: err.message,
    });
  }
});

// User Access API (To generate Admin Secret)
app.post("/api/token", async (req, res) => {
  try {
    const url = `${TELECMI_BASE_URL}/token`;
    const response = await axios.post(url, appBody());
    res.json(response.data);
  } catch (err) {
    console.error("Error generating token", err.message);
    res.status(500).json({
      error: "Failed to generate token",
      details: err.message,
    });
  }
});

// --- User Click2Call ---

// User ClickToCall
app.post("/api/click2call", async (req, res) => {
  try {
    const { token, to, callerid, extra_params } = req.body;

    const url = `${TELECMI_BASE_URL}/click2call`;
    const response = await axios.post(url, {
      token,
      to: Number(to),
      callerid: Number(callerid),
      extra_params,
    });

    res.json(response.data);
  } catch (err) {
    console.error("Error initiating click2call", err.message);
    res.status(500).json({
      error: "Failed to initiate click2call",
      details: err.message,
    });
  }
});

// User ClickToCall HangUp
app.post("/api/click2call/hangup", async (req, res) => {
  try {
    const { token, cmiuuid } = req.body;

    const url = `${TELECMI_BASE_URL}/c2c/hangup`;
    const response = await axios.post(url, { token, cmiuuid });

    res.json(response.data);
  } catch (err) {
    console.error("Error hanging up call", err.message);
    res.status(500).json({
      error: "Failed to hangup call",
      details: err.message,
    });
  }
});

// --- User CDR ---

// User Incoming Calls
app.post("/api/users/in_cdr", async (req, res) => {
  try {
    const { token, type, from, to, page = 1, limit = 10 } = req.body;

    const url = `${TELECMI_BASE_URL}/user/in_cdr`;
    const response = await axios.post(url, {
      token,
      type,
      from,
      to,
      page,
      limit,
    });

    res.json(response.data);
  } catch (err) {
    console.error("Error fetching incoming CDR", err.message);
    res.status(500).json({
      error: "Failed to fetch incoming CDR",
      details: err.message,
    });
  }
});

// User Outgoing Calls
app.post("/api/users/out_cdr", async (req, res) => {
  try {
    const { token, type, from, to, page = 1, limit = 10 } = req.body;

    const url = `${TELECMI_BASE_URL}/user/out_cdr`;
    const response = await axios.post(url, {
      token,
      type,
      from,
      to,
      page,
      limit,
    });

    res.json(response.data);
  } catch (err) {
    console.error("Error fetching outgoing CDR", err.message);
    res.status(500).json({
      error: "Failed to fetch outgoing CDR",
      details: err.message,
    });
  }
});

// User Incoming Missed
app.post("/api/users/missed", async (req, res) => {
  try {
    const { token, from, to, page = 1, limit = 10 } = req.body;

    const url = `${TELECMI_BASE_URL}/user/missed`;
    const response = await axios.post(url, {
      token,
      from,
      to,
      page,
      limit,
    });

    res.json(response.data);
  } catch (err) {
    console.error("Error fetching missed calls", err.message);
    res.status(500).json({
      error: "Failed to fetch missed calls",
      details: err.message,
    });
  }
});

// User Outgoing Missed Calls
app.post("/api/users/out_missed", async (req, res) => {
  try {
    const { token, from, to, page = 1, limit = 10 } = req.body;

    const url = `${TELECMI_BASE_URL}/user/out_missed`;
    const response = await axios.post(url, {
      token,
      from,
      to,
      page,
      limit,
    });

    res.json(response.data);
  } catch (err) {
    console.error("Error fetching outgoing missed calls", err.message);
    res.status(500).json({
      error: "Failed to fetch outgoing missed calls",
      details: err.message,
    });
  }
});

// User Incoming Answered
app.post("/api/users/answered", async (req, res) => {
  try {
    const { token, from, to, page = 1, limit = 10 } = req.body;

    const url = `${TELECMI_BASE_URL}/user/answered`;
    const response = await axios.post(url, {
      token,
      from,
      to,
      page,
      limit,
    });

    res.json(response.data);
  } catch (err) {
    console.error("Error fetching answered calls", err.message);
    res.status(500).json({
      error: "Failed to fetch answered calls",
      details: err.message,
    });
  }
});

// User Outgoing Answered
app.post("/api/users/out_answered", async (req, res) => {
  try {
    const { token, from, to, page = 1, limit = 10 } = req.body;

    const url = `${TELECMI_BASE_URL}/user/out_answered`;
    const response = await axios.post(url, {
      token,
      from,
      to,
      page,
      limit,
    });

    res.json(response.data);
  } catch (err) {
    console.error("Error fetching outgoing answered calls", err.message);
    res.status(500).json({
      error: "Failed to fetch outgoing answered calls",
      details: err.message,
    });
  }
});

// --- User Notes ---

// User Add Notes
app.post("/api/users/notes/add", async (req, res) => {
  try {
    const { token, from, date, msg } = req.body;

    const url = `${TELECMI_BASE_URL}/user/notes/add`;
    const response = await axios.post(url, { token, from, date, msg });

    res.json(response.data);
  } catch (err) {
    console.error("Error adding note", err.message);
    res.status(500).json({
      error: "Failed to add note",
      details: err.message,
    });
  }
});

// User Get Notes
app.post("/api/users/notes/get", async (req, res) => {
  try {
    const { token, phone_number, date } = req.body;

    const url = `${TELECMI_BASE_URL}/user/notes/get`;
    const response = await axios.post(url, { token, phone_number, date });

    res.json(response.data);
  } catch (err) {
    console.error("Error fetching notes", err.message);
    res.status(500).json({
      error: "Failed to fetch notes",
      details: err.message,
    });
  }
});

// --- Admin Call Analysis ---

// Call Analysis
app.post("/api/analysis", async (req, res) => {
  try {
    const { start_date, end_date } = req.body;

    const url = `${TELECMI_BASE_URL}/analysis`;
    const response = await axios.post(url, appBody({ start_date, end_date }));

    res.json(response.data);
  } catch (err) {
    console.error("Error fetching call analysis", err.message);
    res.status(500).json({
      error: "Failed to fetch call analysis",
      details: err.message,
    });
  }
});

// Incoming Answered
app.post("/api/answered", async (req, res) => {
  try {
    const { start_date, end_date, page = 1, limit = 10 } = req.body;

    const url = `${TELECMI_BASE_URL}/answered`;
    const response = await axios.post(
      url,
      appBody({ start_date, end_date, page, limit })
    );

    res.json(response.data);
  } catch (err) {
    console.error("Error fetching answered calls", err.message);
    res.status(500).json({
      error: "Failed to fetch answered calls",
      details: err.message,
    });
  }
});

// Incoming Missed
app.post("/api/missed", async (req, res) => {
  try {
    const { start_date, end_date, page = 1, limit = 10 } = req.body;

    const url = `${TELECMI_BASE_URL}/missed`;
    const response = await axios.post(
      url,
      appBody({ start_date, end_date, page, limit })
    );

    res.json(response.data);
  } catch (err) {
    console.error("Error fetching missed calls", err.message);
    res.status(500).json({
      error: "Failed to fetch missed calls",
      details: err.message,
    });
  }
});

// Outgoing Answered
app.post("/api/out_answered", async (req, res) => {
  try {
    const { start_date, end_date, page = 1, limit = 10 } = req.body;

    const url = `${TELECMI_BASE_URL}/out_answered`;
    const response = await axios.post(
      url,
      appBody({ start_date, end_date, page, limit })
    );

    res.json(response.data);
  } catch (err) {
    console.error("Error fetching outgoing answered calls", err.message);
    res.status(500).json({
      error: "Failed to fetch outgoing answered calls",
      details: err.message,
    });
  }
});

// Outgoing Missed
app.post("/api/out_missed", async (req, res) => {
  try {
    const { start_date, end_date, page = 1, limit = 10 } = req.body;

    const url = `${TELECMI_BASE_URL}/out_missed`;
    const response = await axios.post(
      url,
      appBody({ start_date, end_date, page, limit })
    );

    res.json(response.data);
  } catch (err) {
    console.error("Error fetching outgoing missed calls", err.message);
    res.status(500).json({
      error: "Failed to fetch outgoing missed calls",
      details: err.message,
    });
  }
});

// --- Admin Click-To-Call ---

// Click-To-Call Admin
app.post("/api/admin/click2call", async (req, res) => {
  try {
    const {
      user_id,
      secret,
      to,
      extra_params,
      webrtc,
      followme,
      callerid,
      token,
    } = req.body;

    const url = `${TELECMI_BASE_URL}/webrtc/click2call`;
    const response = await axios.post(url, {
      user_id,
      secret,
      to: Number(to),
      extra_params,
      webrtc,
      followme,
      callerid: Number(callerid),
      token,
    });

    res.json(response.data);
  } catch (err) {
    console.error("Error initiating admin click2call", err.message);
    res.status(500).json({
      error: "Failed to initiate admin click2call",
      details: err.message,
    });
  }
});

// --- Webhooks ---

// Webhook endpoint for incoming CDR
app.post("/api/webhooks/cdr", (req, res) => {
  try {
    const data = req.body;

    // Store CDR data
    if (data.cmiuuid) {
      liveCalls.set(data.cmiuuid, {
        ...data,
        receivedAt: Date.now(),
      });
    }

    res.json({ status: "ok" });
  } catch (err) {
    console.error("Error processing webhook", err.message);
    res.status(500).json({ error: "Failed to process webhook" });
  }
});

// Webhook endpoint for live events
app.post("/api/webhooks/events", (req, res) => {
  try {
    const data = req.body;

    // Store event data
    if (data.cmiuuid) {
      const existing = liveCalls.get(data.cmiuuid) || {};
      liveCalls.set(data.cmiuuid, {
        ...existing,
        ...data,
        lastEventAt: Date.now(),
      });
    }

    res.json({ status: "ok" });
  } catch (err) {
    console.error("Error processing webhook", err.message);
    res.status(500).json({ error: "Failed to process webhook" });
  }
});

// Get live calls
app.get("/api/webhooks/live", (_req, res) => {
  try {
    const calls = Array.from(liveCalls.values());
    res.json({ calls });
  } catch (err) {
    console.error("Error fetching live calls", err.message);
    res.status(500).json({ error: "Failed to fetch live calls" });
  }
});

app.listen(port, () => {
  console.log(`TeleCMI API Server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
});
