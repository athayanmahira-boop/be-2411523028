const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const drinksRouter = require('./routes/drinks');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GET /health
app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'disconnected';
  }

  if (dbStatus === 'connected') {
    res.json({
      status: 'success',
      message: 'Backend is running',
      database: 'connected',
      student: {
        name: 'Athaya Nasywa Mahira',
        nim: '2411523028'
      }
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Backend is running, but database is not connected',
      database: 'disconnected',
      student: {
        name: 'Athaya Nasywa Mahira',
        nim: '2411523028'
      }
    });
  }
});

// GET /schema
app.get('/schema', (req, res) => {
  res.json({
    student: {
      name: 'Athaya Nasywa Mahira',
      nim: '2411523028'
    },
    resource: {
      name: 'drinks',
      label: 'Menu Minuman',
      description: 'Aplikasi untuk mengelola menu minuman coffee shop'
    },
    fields: [
      { name: 'nama_minuman', label: 'Nama Minuman',  type: 'text',   required: true,  showInTable: true  },
      { name: 'kategori',     label: 'Kategori',      type: 'text',   required: true,  showInTable: true  },
      { name: 'ukuran',       label: 'Ukuran',        type: 'text',   required: false, showInTable: true  },
      { name: 'harga',        label: 'Harga (Rp)',    type: 'number', required: true,  showInTable: true  },
      { name: 'stok',         label: 'Stok',          type: 'number', required: false, showInTable: true  },
      { name: 'deskripsi',    label: 'Deskripsi',     type: 'text',   required: false, showInTable: false }
    ],
    endpoints: {
      list:   '/drinks',
      detail: '/drinks/{id}',
      create: '/drinks',
      update: '/drinks/{id}',
      delete: '/drinks/{id}'
    }
  });
});

// GET /
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Backend is running'
  });
});

app.use('/drinks', drinksRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});