const userModel = require('../models/userModel');
const db = require('../config/db');
const logAktivitasService = require('./logAktivitasService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function verifyCaptcha(captchaToken) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    throw new Error('RECAPTCHA_SECRET_KEY belum dikonfigurasi di server');
  }

  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;
  const response = await axios.post(url);
  return response.data.success;
}

async function login(username, password, ip = null) {
  const users = await userModel.findByUsername(username);
  if (users.length === 0) throw new Error('Username atau password salah');

  const user = users[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new Error('Username atau password salah');

  const token = jwt.sign(
    { id_user: user.id_user, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'rahasia_ukk',
    { expiresIn: '1d' }
  );

  await logAktivitasService.catatAktivitas(user.id_user, `LOGIN: ${user.username}`, ip);

  return {
    token,
    user: {
      id_user: user.id_user,
      username: user.username,
      role: user.role,
      no_hp: user.no_hp || null,
      alamat: user.alamat || null
    }
  };
}

async function register({ nama_user, username, password, captchaToken }, ip = null) {
  const isCaptchaValid = await verifyCaptcha(captchaToken);
  if (!isCaptchaValid) {
    throw new Error('Verifikasi CAPTCHA gagal atau kedaluwarsa');
  }

  const existingUsers = await userModel.findByUsername(username);
  if (existingUsers.length > 0) {
    throw new Error('Username sudah digunakan, silakan pilih username lain');
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const result = await db.query(
    'INSERT INTO user (nama_user, username, password_hash, role) VALUES (?, ?, ?, ?)',
    [nama_user, username, passwordHash, 'peminjam']
  );

  const rawId = result.insertId || (result[0] && result[0].insertId);
  const newUserId = rawId ? Number(rawId) : null;

  if (newUserId) {
    await logAktivitasService.catatAktivitas(newUserId, `REGISTER: ${username} (Peminjam)`, ip);
  }

  return {
    success: true,
    user: {
      id_user: newUserId,
      nama_user,
      username,
      role: 'peminjam'
    }
  };
}

module.exports = { 
  login, 
  register 
};