import React from "react";

const Dialer = ({
  onDial,
  onNumberChange,
  phoneNumber = "",
  disabled = false,
  callStatus = "idle",
  callId = null,
  onHold = null,
  onUnhold = null,
  onMute = null,
  onUnmute = null,
  onHangup = null,
}) => {
  const handleNumberClick = (digit) => {
    if (disabled || callStatus !== "idle") return;
    const newNumber = phoneNumber + digit;
    onNumberChange(newNumber);
  };

  const handleBackspace = () => {
    if (disabled || phoneNumber.length === 0 || callStatus !== "idle") return;
    const newNumber = phoneNumber.slice(0, -1);
    onNumberChange(newNumber);
  };

  const handleClear = () => {
    if (disabled || callStatus !== "idle") return;
    onNumberChange("");
  };

  const handleCall = () => {
    if (disabled || !phoneNumber || callStatus !== "idle") return;
    onDial(phoneNumber);
  };

  // Get display text based on call status
  const getDisplayText = () => {
    switch (callStatus) {
      case "calling":
        return "Calling...";
      case "ringing":
        return "Ringing...";
      case "answered":
        return "Call answered";
      case "ended":
        return "Call ended";
      case "idle":
      default:
        return phoneNumber || "Enter number";
    }
  };

  // Get display color based on call status
  const getDisplayColor = () => {
    switch (callStatus) {
      case "calling":
        return "#007bff";
      case "ringing":
        return "#ffc107";
      case "answered":
        return "#28a745";
      case "ended":
        return "#6c757d";
      default:
        return phoneNumber ? "#333" : "#999";
    }
  };

  const isCallActive = callStatus !== "idle" && callStatus !== "ended";

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      {/* Phone Number Display / Call Status */}
      <div
        style={{
          background: callStatus === "answered" ? "#d4edda" : "#f8f9fa",
          border: `2px solid ${
            callStatus === "answered"
              ? "#28a745"
              : callStatus === "ringing"
              ? "#ffc107"
              : "#dee2e6"
          }`,
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "20px",
          textAlign: "center",
          fontSize: callStatus !== "idle" ? "20px" : "24px",
          fontWeight: "bold",
          minHeight: "60px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: getDisplayColor(),
          transition: "all 0.3s ease",
        }}
      >
        <div>{getDisplayText()}</div>
        {callStatus === "idle" && phoneNumber && (
          <div style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>
            {phoneNumber}
          </div>
        )}
        {callId && callStatus !== "idle" && (
          <div
            style={{
              fontSize: "12px",
              color: "#666",
              marginTop: "5px",
              fontWeight: "normal",
            }}
          >
            Call ID: {callId}
          </div>
        )}
      </div>

      {/* Call Controls - Show when call is active */}
      {isCallActive && (
        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            background: "#f8f9fa",
            borderRadius: "10px",
            border: "1px solid #dee2e6",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {callStatus === "answered" && (
              <>
                {onHold && (
                  <button
                    type="button"
                    onClick={onHold}
                    className="btn btn-secondary"
                    style={{
                      padding: "10px 15px",
                      fontSize: "14px",
                      minWidth: "80px",
                    }}
                  >
                    Hold
                  </button>
                )}
                {onUnhold && (
                  <button
                    type="button"
                    onClick={onUnhold}
                    className="btn btn-secondary"
                    style={{
                      padding: "10px 15px",
                      fontSize: "14px",
                      minWidth: "80px",
                    }}
                  >
                    Unhold
                  </button>
                )}
                {onMute && (
                  <button
                    type="button"
                    onClick={onMute}
                    className="btn btn-secondary"
                    style={{
                      padding: "10px 15px",
                      fontSize: "14px",
                      minWidth: "80px",
                    }}
                  >
                    Mute
                  </button>
                )}
                {onUnmute && (
                  <button
                    type="button"
                    onClick={onUnmute}
                    className="btn btn-secondary"
                    style={{
                      padding: "10px 15px",
                      fontSize: "14px",
                      minWidth: "80px",
                    }}
                  >
                    Unmute
                  </button>
                )}
              </>
            )}
            {onHangup && (
              <button
                type="button"
                onClick={onHangup}
                className="btn btn-danger"
                style={{
                  padding: "10px 15px",
                  fontSize: "14px",
                  minWidth: "80px",
                }}
              >
                Hangup
              </button>
            )}
          </div>
        </div>
      )}

      {/* Keypad */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "15px",
          marginBottom: "15px",
        }}
      >
        {/* Row 1: 1, 2, 3 */}
        <button
          type="button"
          onClick={() => handleNumberClick("1")}
          disabled={disabled}
          className="dialer-btn"
          style={dialerButtonStyle}
        >
          <div style={buttonContentStyle}>
            <span style={digitStyle}>1</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => handleNumberClick("2")}
          disabled={disabled}
          className="dialer-btn"
          style={dialerButtonStyle}
        >
          <div style={buttonContentStyle}>
            <span style={digitStyle}>2</span>
            <span style={letterStyle}>ABC</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => handleNumberClick("3")}
          disabled={disabled}
          className="dialer-btn"
          style={dialerButtonStyle}
        >
          <div style={buttonContentStyle}>
            <span style={digitStyle}>3</span>
            <span style={letterStyle}>DEF</span>
          </div>
        </button>

        {/* Row 2: 4, 5, 6 */}
        <button
          type="button"
          onClick={() => handleNumberClick("4")}
          disabled={disabled}
          className="dialer-btn"
          style={dialerButtonStyle}
        >
          <div style={buttonContentStyle}>
            <span style={digitStyle}>4</span>
            <span style={letterStyle}>GHI</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => handleNumberClick("5")}
          disabled={disabled}
          className="dialer-btn"
          style={dialerButtonStyle}
        >
          <div style={buttonContentStyle}>
            <span style={digitStyle}>5</span>
            <span style={letterStyle}>JKL</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => handleNumberClick("6")}
          disabled={disabled}
          className="dialer-btn"
          style={dialerButtonStyle}
        >
          <div style={buttonContentStyle}>
            <span style={digitStyle}>6</span>
            <span style={letterStyle}>MNO</span>
          </div>
        </button>

        {/* Row 3: 7, 8, 9 */}
        <button
          type="button"
          onClick={() => handleNumberClick("7")}
          disabled={disabled}
          className="dialer-btn"
          style={dialerButtonStyle}
        >
          <div style={buttonContentStyle}>
            <span style={digitStyle}>7</span>
            <span style={letterStyle}>PQRS</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => handleNumberClick("8")}
          disabled={disabled}
          className="dialer-btn"
          style={dialerButtonStyle}
        >
          <div style={buttonContentStyle}>
            <span style={digitStyle}>8</span>
            <span style={letterStyle}>TUV</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => handleNumberClick("9")}
          disabled={disabled}
          className="dialer-btn"
          style={dialerButtonStyle}
        >
          <div style={buttonContentStyle}>
            <span style={digitStyle}>9</span>
            <span style={letterStyle}>WXYZ</span>
          </div>
        </button>

        {/* Row 4: *, 0, # */}
        <button
          type="button"
          onClick={() => handleNumberClick("*")}
          disabled={disabled}
          className="dialer-btn"
          style={dialerButtonStyle}
        >
          <div style={buttonContentStyle}>
            <span style={digitStyle}>*</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => handleNumberClick("0")}
          disabled={disabled}
          className="dialer-btn"
          style={dialerButtonStyle}
        >
          <div style={buttonContentStyle}>
            <span style={digitStyle}>0</span>
            <span style={letterStyle}>+</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => handleNumberClick("#")}
          disabled={disabled}
          className="dialer-btn"
          style={dialerButtonStyle}
        >
          <div style={buttonContentStyle}>
            <span style={digitStyle}>#</span>
          </div>
        </button>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr 1fr",
          gap: "15px",
        }}
      >
        {/* Clear Button */}
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
          className="btn btn-secondary"
          style={{
            padding: "15px",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          Clear
        </button>

        {/* Call Button */}
        <button
          type="button"
          onClick={handleCall}
          disabled={disabled || !phoneNumber || callStatus !== "idle"}
          className="btn btn-primary"
          style={{
            padding: "15px",
            fontSize: "18px",
            fontWeight: "bold",
            background:
              phoneNumber && callStatus === "idle" ? "#28a745" : "#6c757d",
            border: "none",
          }}
        >
          📞 Call
        </button>

        {/* Backspace Button */}
        <button
          type="button"
          onClick={handleBackspace}
          disabled={disabled || phoneNumber.length === 0}
          className="btn btn-secondary"
          style={{
            padding: "15px",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          ⌫
        </button>
      </div>
    </div>
  );
};

// Styles
const dialerButtonStyle = {
  background: "#fff",
  border: "2px solid #dee2e6",
  borderRadius: "50%",
  width: "70px",
  height: "70px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.2s",
  fontSize: "24px",
  fontWeight: "bold",
  color: "#333",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

const buttonContentStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const digitStyle = {
  fontSize: "28px",
  fontWeight: "bold",
  lineHeight: "1",
};

const letterStyle = {
  fontSize: "10px",
  color: "#666",
  marginTop: "2px",
  fontWeight: "normal",
};

export default Dialer;
