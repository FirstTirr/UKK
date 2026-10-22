const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoute');
const kategoriRoutes = require('./routes/kategoriRoute');
const pengembalianRoutes = require('./routes/pengembalianRoute');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Buat Parent Router khusus untuk API
const apiRouter = express.Router();

// 2. Daftarkan semua route ke apiRouter (tanpa nulis /api lagi)
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/kategori', kategoriRoutes);
apiRouter.use('/alat', require('./routes/alatRoute'));
apiRouter.use('/peminjaman', require('./routes/peminjamanRoute'));
apiRouter.use('/pengembalian', require('./routes/pengembalianRoute'));

// 3. Pasang apiRouter ke app dengan prefix '/api'
app.use('/api', apiRouter);

// Health check endpoint
app.get('/api', (req, res) => {
  res.send('Server Backend UKK Aktif!');
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});