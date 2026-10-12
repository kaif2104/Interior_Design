import { useState, useEffect, useRef } from 'react';
import './Captcha.css';

function Captcha({ onCaptchaChange }) {
  const canvasRef = useRef(null);
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');

  // Character set excluding easily confused characters (like 0, O, I, l, 1)
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  const generateCaptchaText = (length = 6) => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  };

  const drawCaptcha = (text) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f9f6f0');
    gradient.addColorStop(1, '#eee7dd');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Random noise lines
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, 0.35)`;
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height
      );
      ctx.stroke();
    }

    // Random noise dots
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, 0.4)`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw characters with distinct rotations and colors
    const colors = ['#1a1a1a', '#2c3e50', '#8b5a2b', '#1e3799', '#2e86de', '#6c5ce7'];
    const fonts = ['bold 24px Arial', 'bold 24px Verdana', 'bold 24px Georgia', 'bold 24px "Trebuchet MS"'];

    const charSpacing = width / (text.length + 1);
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      ctx.save();
      const x = (i + 1) * charSpacing;
      const y = height / 2 + (Math.random() * 6 - 3);

      ctx.translate(x, y);
      const angle = (Math.random() - 0.5) * 0.45; // rotate ±13 degrees
      ctx.rotate(angle);

      ctx.font = fonts[Math.floor(Math.random() * fonts.length)];
      ctx.fillStyle = colors[i % colors.length];
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.shadowColor = 'rgba(0,0,0,0.15)';
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.shadowBlur = 2;

      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  };

  const refreshCaptcha = () => {
    const newText = generateCaptchaText();
    setCaptchaText(newText);
    setUserInput('');
    drawCaptcha(newText);
    if (onCaptchaChange) {
      onCaptchaChange('', newText);
    }
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value.toUpperCase();
    setUserInput(val);
    if (onCaptchaChange) {
      onCaptchaChange(val, captchaText);
    }
  };

  return (
    <div className="captcha-container">
      <div className="captcha-header-row">
        <label className="captcha-label">
          <span>Security Verification</span>
          <span className="captcha-badge">BOT PROTECTION</span>
        </label>
      </div>

      <div className="captcha-visual-row">
        <canvas
          ref={canvasRef}
          width={180}
          height={50}
          className="captcha-canvas"
        />
        <button
          type="button"
          className="btn-refresh-captcha"
          onClick={refreshCaptcha}
          title="Click to generate a new captcha"
        >
          ↻
        </button>
      </div>

      <div className="captcha-input-wrapper">
        <input
          type="text"
          className="captcha-input"
          placeholder="Enter the 6 characters above"
          value={userInput}
          onChange={handleInputChange}
          maxLength={6}
          required
        />
        <div className="captcha-hint">Type the characters shown in the box (case-insensitive).</div>
      </div>
    </div>
  );
}

export default Captcha;
