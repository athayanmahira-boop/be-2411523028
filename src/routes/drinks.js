const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /drinks
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      'SELECT id, nama_minuman, nama_minuman as name, kategori, ukuran, harga, stok, deskripsi FROM drinks ORDER BY id ASC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM drinks');
    const total = countResult[0].total;

    res.json({
      status: 'success',
      message: 'Data berhasil diambil',
      items: rows,
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /drinks/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM drinks WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ status: 'error', message: 'Data tidak ditemukan' });
    res.json({ status: 'success', message: 'Data berhasil diambil', data: rows[0] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// POST /drinks
router.post('/', async (req, res) => {
  try {
    const { nama_minuman, kategori, ukuran, harga, stok, deskripsi } = req.body;
    if (!nama_minuman || !kategori || !harga) return res.status(400).json({ status: 'error', message: 'nama_minuman, kategori, harga wajib diisi' });
    const [result] = await pool.query(
      'INSERT INTO drinks (nama_minuman, kategori, ukuran, harga, stok, deskripsi) VALUES (?, ?, ?, ?, ?, ?)',
      [nama_minuman, kategori, ukuran || null, harga, stok || 0, deskripsi || null]
    );
    const [newRow] = await pool.query('SELECT * FROM drinks WHERE id = ?', [result.insertId]);
    res.status(201).json({ status: 'success', message: 'Data berhasil ditambahkan', data: newRow[0] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PUT /drinks/:id
router.put('/:id', async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM drinks WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ status: 'error', message: 'Data tidak ditemukan' });
    const { nama_minuman, kategori, ukuran, harga, stok, deskripsi } = req.body;
    await pool.query(
      'UPDATE drinks SET nama_minuman = ?, kategori = ?, ukuran = ?, harga = ?, stok = ?, deskripsi = ? WHERE id = ?',
      [
        nama_minuman || existing[0].nama_minuman,
        kategori || existing[0].kategori,
        ukuran || existing[0].ukuran,
        harga || existing[0].harga,
        stok !== undefined ? stok : existing[0].stok,
        deskripsi !== undefined ? deskripsi : existing[0].deskripsi,
        req.params.id
      ]
    );
    const [updated] = await pool.query('SELECT * FROM drinks WHERE id = ?', [req.params.id]);
    res.json({ status: 'success', message: 'Data berhasil diubah', data: updated[0] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// DELETE /drinks/:id
router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM drinks WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ status: 'error', message: 'Data tidak ditemukan' });
    await pool.query('DELETE FROM drinks WHERE id = ?', [req.params.id]);
    res.json({ status: 'success', message: 'Data berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;