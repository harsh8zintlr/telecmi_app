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
  const appid = TELECMI_APP_ID;
  const secret = TELECMI_APP_SECRET;
  ensureAppCreds(appid, secret);
  return { appid, secret, ...extra };
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// --- Auth / Admin ---
// This just verifies that appid/secret are valid by calling account/balance.
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

// List users -> TeleCMI /v2/user/list
// Docs: https://doc.telecmi.com/chub/docs/agent-agent-list
// payload required : {appid(number), secret(string), page(number), limit(number)}
// response data : {code(number),status(string),count(number),agents:{agent_id(string),name(string),extension(number),password(string),notify(boolean),phone(string),start_time(number),end_time(number)}[]}

// Create user -> TeleCMI /v2/user/add
// Docs: https://doc.telecmi.com/chub/docs/agent-add-agent
// payload required : {appid(number), secret(string), extension(number), name(string), phone_number(string), password(string), start_time(number), end_time(number),sms_alert(boolean)}
// response data : {code,status,msg,agent:{agent_id,name,extension}}

// Update user -> TeleCMI /v2/user/update
// Docs: https://doc.telecmi.com/chub/docs/agent-update-agent
// payload required : {appid(number), secret(string), id(User Id)(string), name(string), phone_number(string), password(string), start_time(number), end_time(number),sms_alert(boolean)}
// response data : {code(number),status(string),msg(string),agent:{name(string),password(string),notify(boolean),phone(string),start_time(number),end_time(number)}}

// Delete user -> TeleCMI /v2/user/delete
// Docs: https://doc.telecmi.com/chub/docs/user-delete?utm_source=openai (user_id param)
// payload required : {appid(number), secret(string), id(User Id)(string)}
// response data : {code(number),status(string)}

// --- User login (REST token for click2call, notes, etc.) ---

// Login user -> TeleCMI /v2/user/login
// Docs: https://doc.telecmi.com/chub/docs/login-token
// payload required : {id(user id)(number), password(string)}
// response data : {code(number),msg(string),token(string),agent:{category(string),id(string),inet_no(number),name(string)}}

// User Access APi (To generate Admin Secret) -> TeleCMI /v2/token
// Docs: https://doc.telecmi.com/chub/docs/user-access
// payload required : {appid(number), secret(string)}
// response data : {secret(string),expiresIn(number),code(number)}

// --- User Click2Call (REST) ---

// User ClickToCall -> TeleCMI /v2/click2call
// Docs: https://doc.telecmi.com/chub/docs/click-to-call
// payload required : {token(string), to(number),extra_params{crm:boolean},callerid(number)}
// response data : {code(number),msg(string),request_id(string)}

// User ClickToCall HangUp -> TeleCMI /v2/c2c/hangup
// Docs: https://doc.telecmi.com/chub/docs/click-to-call-hangup
// payload required : {token(string)(user Token), cmiuuid(string)(A unique identifier of Leg A call)}
// response data : {code(number),msg(string)}

// User Incoming Calls -> TeleCMI /v2/user/in_cdr
// Docs: https://doc.telecmi.com/chub/docs/agent-incoming
// payload required : {type(1(missed),1(answered)), token(string),from(number),to(number),page(number),limit(number)}}
// response data : {count(number),cdr{cmuuid(string),duration(number),notes{msg(string),date(number),agent(string)(Id)}[],billedsec(number),rate(float),name(string),from(number),time(number)}[]}

// User Outgoing Calls -> TeleCMI /v2/user/out_cdr
// Docs: https://doc.telecmi.com/chub/docs/agent-outgoing
// payload required : {type(1(missed),1(answered)), token(string),from(number),to(number),page(number),limit(number)}}
// response data : {count(number),cdr{cmuuid(string),duration(number),billedsec(number),filename(string),rate(float),record(boolean),name(string),from(number),time(number),region(string}[]}

// User Incoming Missed -> TeleCMI /v2/user/missed
// Docs: https://doc.telecmi.com/chub/docs/agent-incoming-missed
// payload required : {token(string),from(number),to(number),page(number),limit(number)}}
// response data : {count(number),cdr{cmuuid(string),duration(number),billedsec(number),filename(string),rate(float),record(boolean),name(string),from(number),time(number),region(string}[]}

// User Outgoing Missed Calls -> TeleCMI /v2/user/out_missed
// Docs: https://doc.telecmi.com/chub/docs/agent-outgoing-missed
// payload required : {token(string),from(number),to(number),page(number),limit(number)}}
// response data : {count(number),cdr{cmuuid(string),duration(number),billedsec(number),rate(float),name(string),from(number),time(number)}[]}

// User Incoming Answered -> TeleCMI /v2/user/answered
// Docs: https://doc.telecmi.com/chub/docs/agent-incoming-answered
// payload required : {token(string),from(number),to(number),page(number),limit(number)}}
// response data : {count(number),cdr{cmuuid(string),duration(number),filename(string),billedsec(number),rate(float),record(boolean),name(string),from(number),time(number)}[]}

// User Outgoing Answered -> TeleCMI /v2/user/out_answered
// Docs: https://doc.telecmi.com/chub/docs/agent-outgoing-answered
// payload required : {token(string),from(number),to(number),page(number),limit(number)}}
// response data : {count(number),cdr{cmuuid(string),duration(number),notes{msg(string),date(number),agent(string)(Id)}[],billedsec(number),filename(string),rate(float),record(boolean),name(string),from(number),time(number)}[]}

// User Add Notes -> TeleCMI /v2/user/notes/add
// Docs: https://doc.telecmi.com/chub/docs/agent-add-notes
// payload required : {token(string),from(number),date(number),msg(string)}}
// response data : {code(number),status(string)}

// User Get Notes -> TeleCMI /v2/user/notes/get
// Docs: https://doc.telecmi.com/chub/docs/agent-get-notes
// payload required : {token(string),phone_numver(number),date(number)}}
// response data : {notes{msg(string),date(number),agent(string)(Id)}[]}

// --- Calls (Webhooks) ---

// ---------------------- Incoming CDR -----------------------

// Missed
// Docs: https://doc.telecmi.com/chub/docs/incoming-missed
// response data : { virtual_number: number, custom: string, appid: number, type: 'cdr', direction: 'inbound', cmiuuid: string, status: 'missed', from: number, time: number, waitedsec: number, hangup_reason: string, voicemail: boolean, voicename: string, conversation_uuid: string, team: string, ivr_name: string };

// User Missed
// Docs: https://doc.telecmi.com/chub/docs/incoming-user-missed
// response data : { virtual_number: number, custom: string, appid: number, type: 'cdr', direction: 'inbound', leg: string, cmiuuid: string, user: string, status: 'missed', to: number, from: number, time: number, team: string, hangup_reason: string, conversation_uuid: string, ivr_name: string };

//  Answered
// Docs: https://doc.telecmi.com/chub/docs/incoming-answered
// response data : { virtual_number: number, custom: string, appid: number, type: 'cdr', direction: 'inbound', cmiuuid: string, user: string, status: 'answered', to: number, from: number, time: number, answeredsec: number, team: string, hangup_reason: string, record: boolean, filename: string, conversation_uuid: string, ivr_name: string };

// ---------------------- Outgoing CDR -----------------------

// Missed
// Docs: https://doc.telecmi.com/chub/docs/outgoing-missed
// response data : { virtual_number: string, call_id: string, custom: string, leg: string, type: 'cdr', appid: number, to: number, cmiuuid: string, status: 'missed', user: string, time: number, direction: 'outbound', hangup_reason: string, request_id: string, extra_params: string };

//  Answered
// Docs: https://doc.telecmi.com/chub/docs/outgoing-answered
// response data : { virtual_number: string, call_id: string, custom: string, leg: string, type: 'cdr', appid: number, to: number, cmiuuid: string, status: 'answered', user: string, time: number, direction: 'outbound', answeredsec: number, hangup_reason: string, request_id: string, extra_params: string };

// ---------------------- Incoming Live Events -----------------------

// Incoming Waiting Leg A
// Docs: https://doc.telecmi.com/chub/docs/live-incoming-waiting
// response data : { type: 'event', direction: 'inbound', conversation_uuid: string, cmiuuid: string, from: string, app_id: number, time: number, to: string, custom: string, status: 'waiting' };

//  Incoming Answered Leg A
// Docs: https://doc.telecmi.com/chub/docs/live-incoming-answered
// response data : { type: 'event', direction: 'inbound', conversation_uuid: string, cmiuuid: string, from: string, app_id: number, time: number, to: string, custom: string, status: 'answered' };

//  Incoming hangup Leg A
// Docs: https://doc.telecmi.com/chub/docs/live-incoming-hangup
// response data : { type: 'event', direction: 'inbound', conversation_uuid: string, cmiuuid: string, from: string, app_id: number, time: number, to: string, custom: string, status: 'hangup' };

//  Incoming Started Leg B
// Docs: https://doc.telecmi.com/chub/docs/live-outgoing-started
// response data : { leg: string, type: 'event', team: string, user: string, conversation_uuid: string, cmiuuid: string, direction: 'outbound', from: string, app_id: number, time: number, custom: string, status: 'started' };

//  Incoming Answered Leg B
// Docs: https://doc.telecmi.com/chub/docs/live-outgoing-answered
// response data : { leg: string, type: 'event', team: string, user: string, conversation_uuid: string, cmiuuid: string, direction: 'outbound', from: string, app_id: number, time: number, custom: string, status: 'answered' };

//  Incoming Hangup Leg B
// Docs: https://doc.telecmi.com/chub/docs/live-outgoing-hangup
// response data : { leg: string, type: 'event', team: string, user: string, conversation_uuid: string, cmiuuid: string, direction: 'outbound', from: string, app_id: number, time: number, custom: string, status: 'hangup' };

// ---------------------- Outgoing Live Events -----------------------

// Outgoing Started Event
// Docs: https://doc.telecmi.com/chub/docs/live-outgoing-out-started
// response data :
// Leg A: { call_id: string, leg: string, type: 'event', user: string, cmiuuid: string, direction: 'outbound', callerid: string, app_id: number, time: number, custom: string, extra_params: string, request_id: string, status: 'started', to: string, conversation_uuid: string };
// Leg B: { call_id: string, leg: string, type: 'event', user: string, cmiuuid: string, direction: 'outbound', callerid: string, app_id: number, time: number, custom: string, extra_params: string, request_id: string, status: 'started', to: string, conversation_uuid: string };

//  Outgoing Answered Event
// Docs: https://doc.telecmi.com/chub/docs/live-outgoing-out-answered
// response data :
// Leg A: { call_id: string, leg: string, type: 'event', user: string, cmiuuid: string, direction: 'outbound', callerid: string, app_id: number, time: number, custom: string, extra_params: string, request_id: string, status: 'answered', to: string, conversation_uuid: string };
// Leg B: { call_id: string, leg: string, type: 'event', user: string, cmiuuid: string, direction: 'outbound', callerid: string, app_id: number, time: number, custom: string, extra_params: string, request_id: string, status: 'answered', to: string, conversation_uuid: string };

//  Outgoing Hangup Event
// Docs: https://doc.telecmi.com/chub/docs/live-outgoing-out-hangup
// response data :
// Leg A: { call_id: string, leg: string, type: 'event', user: string, cmiuuid: string, direction: 'outbound', callerid: string, app_id: number, time: number, custom: string, extra_params: string, request_id: string, status: 'hangup', to: string, conversation_uuid: string };
// Leg B: { call_id: string, leg: string, type: 'event', user: string, cmiuuid: string, direction: 'outbound', callerid: string, app_id: number, time: number, custom: string, extra_params: string, request_id: string, status: 'hangup', to: string, conversation_uuid: string };

// ---------------------- Call Events -----------------------

// Call Analysis -> TeleCMI /v2/analysis
// Docs: https://doc.telecmi.com/chub/docs/call-analysis
// payload required : {appid(number),secret(string),start_date(number),end_date(number)}
// response data : { code: number, total: number, answered: number, missed: number };

// Incoming Answered -> TeleCMI /v2/answered
// Docs: https://doc.telecmi.com/chub/docs/answered-call
// payload required : { appid: number, secret: string, start_date: number, end_date: number, page: number, limit: number };
// response data : { count: number, cdr: { cmiuid: string, duration: number, agent: string, notes?: { msg: string, date: number, agent: string }[], billedsec: number, filename: string, rate: number, record: string, name: string, from: number, to: number, time: number }[], code: number };

// Incoming Missed -> TeleCMI /v2/missed
// Docs: https://doc.telecmi.com/chub/docs/missed-call
// payload required : { appid: number, secret: string, start_date: number, end_date: number, page: number, limit: number };
// response data : { count: number, cdr: { cmiuid: string, duration: number, notes?: { msg: string, date: number, agent: string }[], billedsec: number, rate: number, name: string, from: number, to: number, time: number }[], code: number };

// Outgoing Answered -> TeleCMI /v2/out_answered
// Docs: https://doc.telecmi.com/chub/docs/out-answered
// payload required : { appid: number, secret: string, start_date: number, end_date: number, page: number, limit: number };
// response data : { count: number, cdr: { cmiuid: string, duration: number, agent: string, notes?: { msg: string, date: number, agent: string }[], billedsec: number, filename: string, rate: number, record: string, name: string, from: string, to: number, time: number }[], code: number };

// Outgoing Missed -> TeleCMI /v2/out_missed
// Docs: https://doc.telecmi.com/chub/docs/out-missed
// payload required : { appid: number, secret: string, start_date: number, end_date: number, page: number, limit: number };
// response data : { count: number, cdr: { cmiuid: string, duration: number, agent: string, notes?: { msg: string, date: number, agent: string }[], billedsec: number, rate: number, name: string, from: string, to: number, time: number }[], code: number };

// ---------------------- Admin Click TO Call -----------------------

// Click-To-Call Admin -> TeleCMI /v2/out_missed
// Docs: https://doc.telecmi.com/chub/docs/out-missed
// payload required :{ user_id: string, secret: string, to: number, extra_params: { crm: boolean }, webrtc: boolean, followme: boolean, callerid: number };
// response data : { code: number, msg: string, request_id: string };

// ---------------------- Piopiy SDK -----------------------

//PIOPIY WebRTC SDK allows you to make and receive voice calls, where making voice calls can be made to a public switched telephone network(PSTN), APP to APP calling and browser to browser calling.

// Installation :- npm install piopiyjs

// Initializing the PIOPIY SDK Object
var piopiy = new PIOPIY({
  name: "Display Name", //Your Display Name in App
  debug: false, //Enable debug message in browser console
  autoplay: true, //Handle media stream automatically
  ringTime: 60, //Your incoming call ringing time in seconds
});

// Login
piopiy.login("user_id", "password", "SBC_URI");

// Make Call
piopiy.call("PHONE_NUMBER");
// OR
piopiy.call("PHONE_NUMBER", { extra_param: "lead" }); //An optional object containing additional parameters for the call.

// Get Call Id
piopiy.getCallId();

// Transfer Call
piopiy.transfer("USER_EXTENSION_NUMBER OR PHONE_NUMBER"); //Enter phone number or user extension number ,Phone number start with country code example '13158050050'

// Merge Call
piopiy.merge();

// Cancel Call
piopiy.cancel();

// Send DTMF
piopiy.sendDtmf("DTMF_TONE");

// Hold Call
piopiy.hold();

// unhold Call
piopiy.unHold();

// Mute Call
piopiy.mute();

// Unmute Call
piopiy.unMute();

// Answer Call
piopiy.answer();

// Reject Call
piopiy.reject();

// hangup Call
piopiy.terminate();

// Logout
piopiy.logout();

// Login
piopiy.on("login", function (object) {
  //  Data is JSON it contain event and status.
});
// Example
piopiy.on("login", function (object) {
  if (object.code == 200) {
    //  Login successfully and do your stuff here.
  }
});

// Login failed
piopiy.on("loginFailed", function (object) {
  //  Data is JSON it contain event and status.
});
// Example
piopiy.on("loginFailed", function (object) {
  if (object.code == 401) {
    //  Verify that the user_id and password are correct.
  }
});

// Trying
piopiy.on("trying", function (object) {
  //  Data is JSON it contain event and status.
});
// Example
piopiy.on("trying", function (object) {
  if (object.code == 100) {
    //  The outgoing call is currently being started.
  }
});

// RInging
piopiy.on("ringing", function (object) {
  //  Data is JSON it contain event and status.
});
// Example
piopiy.on("ringing", function (object) {
  if (object.code == 183) {
    // An incoming or outgoing call is ringing.
  }
});

// Answered
piopiy.on("answered", function (object) {
  //  Data is JSON it contain event and status.
});
// Example
piopiy.on("answered", function (object) {
  if (object.code == 200) {
    // An incoming or outgoing call is answered.
  }
});

// CallStream
piopiy.on("callStream", function (object) {
  //  Data is JSON it contain event and status.
});
// Example
piopiy.on("callStream", function (object) {
  // MediaStream has been established.
});

// Trasnfer
piopiy.on("transfer", function (object) {
  //  Data is JSON it contain event and status.
});

// Example
piopiy.on("transfer", function (object) {
  if (object.code == 100) {
    // An incoming or outgoing call is transfered.
  }
});

// Incoming Call
piopiy.on("inComingCall", function (object) {
  //  Data is JSON it contain event and status.
});

// hangup
piopiy.on("hangup", function (object) {
  //  Data is JSON it contain event and status.
});
// Example
piopiy.on("hangup", function (object) {
  if (object.code == 200) {
    //  to hangup the incoming and ongoing calls.
  }
});

// Ended
piopiy.on("ended", function (object) {
  //  Data is JSON it contain event and status.
});
// Example
piopiy.on("ended", function (object) {
  if (object.code == 200) {
    //  An incoming or outgoing call is ended.
  }
});

// Hold
piopiy.on("hold", function (object) {
  //  Data is JSON it contain event and status.
});
//Example
piopiy.on("hold", function (object) {
  if (object.code == 200) {
    //  The call is now being hold.
  }
});

// UnHold
piopiy.on("unhold", function (object) {
  //  Data is JSON it contain event and status.
});
// Example
piopiy.on("unhold", function (object) {
  if (object.code == 200) {
    //  The call is now being released.
  }
});

//RTCStats
piopiy.on("RTCStats", function (object) {
  //  Data is JSON it contain event and status.
});
// Example
piopiy.on("RTCStats", function (object) {
  if (object.codec == "audio/PCM") {
    //  The user logged out successfully.
  }
});

// Error
piopiy.on("error", function (object) {
  //  Data is JSON it contain event and status.
});
// Example
piopiy.on("error", function (object) {
  if (object.code == 1001 || object.code == 1002) {
    //  If there are any incorrect commands in the function, displays error.
  }
});

// Logout
piopiy.on("logout", function (object) {
  //  Data is JSON it contain event and status.
});
// Example
piopiy.on("logout", function (object) {
  if (object.code == 200) {
    //  The user logged out successfully.
  }
});
