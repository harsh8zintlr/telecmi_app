# WebRTC SDK Integration Guide

## PIOPIY SDK for WebRTC Calls

The PIOPIY WebRTC SDK is used for making and receiving WebRTC calls. According to the documentation in `telecmi_apis_doc.js`, the SDK should be integrated in the client-side application.

## Installation

```bash
npm install piopiyjs
```

## Where to Integrate

The SDK integration should be implemented in a **new component** or integrated into an existing component for handling WebRTC calls. Recommended locations:

1. **New Component: `WebRTCCall.jsx`** (Recommended)

   - Create a dedicated component for WebRTC functionality
   - Handle incoming calls via `piopiy.on("inComingCall", ...)`
   - Provide UI for answering/rejecting calls
   - Add to `App.jsx` as a new tab

2. **Integration in `Click2Call.jsx`**
   - Add WebRTC call handling alongside REST API calls
   - Use SDK for WebRTC calls when `webrtc: true`
   - Use REST API for non-WebRTC calls

## SDK Usage

### Initialization

```javascript
var piopiy = new PIOPIY({
  name: "Display Name",
  debug: false,
  autoplay: true,
  ringTime: 60,
});
```

### Login

```javascript
piopiy.login("user_id", "password", "SBC_URI");
```

### Handling Incoming Calls

```javascript
piopiy.on("inComingCall", function (object) {
  // Show incoming call UI
  // Display caller information
  // Provide answer/reject buttons
});

// Answer incoming call
piopiy.answer();

// Reject incoming call
piopiy.reject();
```

### Making Outgoing Calls

```javascript
piopiy.call("PHONE_NUMBER");
// OR
piopiy.call("PHONE_NUMBER", { extra_param: "lead" });
```

## Key Events

- `inComingCall` - For picking incoming WebRTC calls
- `answered` - Call answered
- `hangup` - Call ended
- `ringing` - Call ringing
- `login` - Login successful
- `loginFailed` - Login failed

## Current Status

- SDK documentation is available in `telecmi_apis_doc.js` (lines 261-478)
- SDK is **NOT yet installed** in `client/package.json`
- SDK integration is **NOT yet implemented** in any component
- Admin Click2Call now supports `webrtc` and `followme` parameters with mutual exclusivity

## Next Steps

1. Install PIOPIY SDK: `npm install piopiyjs`
2. Create `WebRTCCall.jsx` component
3. Initialize SDK in the component
4. Handle incoming calls with `piopiy.on("inComingCall", ...)`
5. Add component to `App.jsx` navigation
6. Get SBC_URI from TeleCMI configuration
