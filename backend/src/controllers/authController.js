const authService = require('../services/authService');

async function login(req, res) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password wajib diisi' });
    }
    const result = await authService.login(username, password, req.ip);
    res.json({ message: 'Login berhasil', ...result });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

async function register(req, res) {
  try {
    const { nama_user, username, password, captchaToken } = req.body;
    const result = await authService.register({ nama_user, username, password, captchaToken }, req.ip);
    res.status(201).json({ message: 'Registrasi berhasil', ...result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { 
  login, 
  register 
};