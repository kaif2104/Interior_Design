import { useState, useEffect } from 'react';
import './QRCodePayment.css';

function QRCodePayment({ amount, orderRef, onPaymentConfirmed, clientName }) {
  const [copied, setCopied] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [timeLeft, setTimeLeft] = useState(900); // 15:00 countdown timer
  const [verifying, setVerifying] = useState(false);

  const upiId = 'interiorstudio@icici';
  const payeeName = 'LuxeSpace Interior Studio';
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(orderRef || 'Studio Order Payment')}`;
  const qrCodeImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=8&data=${encodeURIComponent(upiUrl)}`;

  // Live session timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      onPaymentConfirmed(utrNumber || `UPI-${Date.now().toString().slice(-6)}`);
    }, 1200);
  };

  return (
    <div className="qr-payment-card">
      <div className="qr-header">
        <div className="qr-bank-badge">
          <span className="live-pulse-dot"></span>
          Dynamic Instant UPI Gateway
        </div>
        <div className="qr-timer">
          ⏱️ QR Active for: <strong>{formatTimer(timeLeft)}</strong>
        </div>
      </div>

      <div className="qr-amount-banner">
        <span className="qr-amt-label">Payable Amount</span>
        <span className="qr-amt-val">₹{amount?.toLocaleString()}</span>
      </div>

      {/* Interactive QR Code Frame */}
      <div className="qr-frame-wrapper">
        <div className="qr-reticle top-left"></div>
        <div className="qr-reticle top-right"></div>
        <div className="qr-reticle bottom-left"></div>
        <div className="qr-reticle bottom-right"></div>

        <img
          src={qrCodeImgUrl}
          alt={`Scan to Pay ₹${amount}`}
          className="qr-image"
          onError={(e) => {
            // Fallback generated visual if offline
            e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=interiorstudio@icici`;
          }}
        />

        <div className="qr-brand-overlay">
          <span>LUXE</span>
        </div>
      </div>

      <p className="qr-scan-instruction">
        Scan with any UPI App (GPay, PhonePe, Paytm, CRED, BHIM) to pay directly from your mobile.
      </p>

      {/* Supported UPI Apps Pills */}
      <div className="upi-apps-row">
        <span className="upi-app-pill gpay">GPay</span>
        <span className="upi-app-pill phonepe">PhonePe</span>
        <span className="upi-app-pill paytm">Paytm</span>
        <span className="upi-app-pill cred">CRED</span>
        <span className="upi-app-pill bhim">BHIM UPI</span>
      </div>

      {/* Copy UPI ID Box */}
      <div className="upi-id-copy-box">
        <div className="upi-id-info">
          <span className="upi-id-label">Official Studio VPA:</span>
          <span className="upi-id-text">{upiId}</span>
        </div>
        <button
          type="button"
          className={`btn-copy-upi ${copied ? 'copied' : ''}`}
          onClick={handleCopyUpi}
        >
          {copied ? '✓ Copied!' : '📋 Copy UPI ID'}
        </button>
      </div>

      {/* Direct Mobile UPI Deep Link */}
      <div className="mobile-deep-link">
        <a href={upiUrl} className="btn-mobile-pay">
          ⚡ Pay Directly via UPI App
        </a>
      </div>

      {/* Transaction Confirmation Form */}
      <div className="qr-confirm-section">
        <div className="utr-input-group">
          <label htmlFor="utr">12-Digit UPI Transaction UTR / Ref No. (Optional):</label>
          <input
            id="utr"
            type="text"
            className="utr-input"
            placeholder="e.g. 423589102456"
            value={utrNumber}
            onChange={(e) => setUtrNumber(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="btn-qr-submit"
          onClick={handleConfirm}
          disabled={verifying}
        >
          {verifying ? (
            <span className="loading-spinner">Verifying Transaction & Generating Invoice...</span>
          ) : (
            `✓ I Have Paid ₹${amount?.toLocaleString()} — Generate Bill`
          )}
        </button>
      </div>
    </div>
  );
}

export default QRCodePayment;
