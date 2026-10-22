const rateLimit = require('express-rate-limit');

// Batasi maksimal 5 kali percobaan login per 15 menit dari 1 IP
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 menit
  max: 5, // Maksimal 5 attempt
  message: {
    message: 'Maksimal percobaan login tercapai. Silakan coba lagi setelah 5 menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter };