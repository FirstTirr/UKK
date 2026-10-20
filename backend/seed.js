const bcrypt = require('bcrypt');
const db = require('./src/config/db');

async function seed() {
  try {
    const hash = await bcrypt.hash('admin123', 10);
    
    // Hapus dulu kalau username admin udah pernah dibuat
    await db.query('DELETE FROM user WHERE username = ?', ['admin']);
    
    // Insert user admin baru
    await db.query('INSERT INTO user (username, password_hash, role) VALUES (?, ?, ?)', ['admin', hash, 'admin']);
    
    console.log('User admin berhasil dibuat! Password: admin123');
    process.exit();
  } catch (err) {
    console.error('Error seed:', err);
    process.exit(1);
  }
}

seed();