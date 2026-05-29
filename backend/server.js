const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// 1. KONEKSI DATABASE
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "laundry_admin_only" // Nama database baru kita
});

db.connect((err) => {
    if (err) console.error('Database connection failed:', err);
    else console.log('Terkoneksi ke Database MySQL');
});

// 2. KONFIGURASI EMAIL (Untuk Lupa Password)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'EMAIL_KAMU@gmail.com', // Ganti emailmu
        pass: 'KODE_APP_PASSWORD_16_DIGIT' // Ganti App Password
    }
});

// =================== API AUTHENTICATION ===================

app.post('/api/register', (req, res) => {
    const { nama, email, password } = req.body;
    const sql = "INSERT INTO users (nama, email, password) VALUES (?, ?, ?)";
    db.query(sql, [nama, email, password], (err) => {
        if (err) return res.status(500).json({ success: false, message: "Email sudah terdaftar!" });
        res.json({ success: true, message: "Berhasil daftar! Silakan login." });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(sql, [email, password], (err, results) => {
        if (err) return res.status(500).json({ success: false });
        if (results.length > 0) res.json({ success: true, user: results[0] });
        else res.status(401).json({ success: false, message: "Email atau Password salah!" });
    });
});

app.post('/api/forgot-password', (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60000); // Expire 5 menit

    db.query("UPDATE users SET otp_code = ?, otp_expiry = ? WHERE email = ?", [otp, expiry, email], (err, result) => {
        if (result.affectedRows === 0) return res.status(404).json({ message: "Email tidak ditemukan" });

        transporter.sendMail({
            from: 'Sistem Admin Laundry',
            to: email,
            subject: 'Kode OTP Reset Password',
            text: `Kode OTP Anda: ${otp}. Berlaku selama 5 menit.`
        }, (error) => {
            if (error) return res.status(500).json({ message: "Gagal kirim email" });
            res.json({ success: true, message: "OTP terkirim ke email!" });
        });
    });
});

app.post('/api/reset-password', (req, res) => {
    const { email, otp, newPassword } = req.body;
    const sql = "SELECT * FROM users WHERE email = ? AND otp_code = ? AND otp_expiry > NOW()";
    db.query(sql, [email, otp], (err, results) => {
        if (results.length > 0) {
            db.query("UPDATE users SET password = ?, otp_code = NULL, otp_expiry = NULL WHERE email = ?", [newPassword, email], () => {
                res.json({ success: true, message: "Password berhasil diubah!" });
            });
        } else res.status(400).json({ success: false, message: "OTP salah atau kadaluarsa" });
    });
});

// =================== API TRANSAKSI (CRUD) ===================

// Tampil Semua Transaksi
app.get('/api/transaksi', (req, res) => {
    db.query("SELECT * FROM transaksi ORDER BY tgl_masuk DESC", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Input Transaksi Baru
app.post('/api/transaksi', (req, res) => {
    const { nama_pelanggan, no_hp, layanan, berat, total_harga, status_bayar, metode_pembayaran } = req.body;
    const sql = "INSERT INTO transaksi (nama_pelanggan, no_hp, layanan, berat, total_harga, status_bayar, metode_pembayaran) VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [nama_pelanggan, no_hp, layanan, berat, total_harga, status_bayar || 'Belum Lunas', metode_pembayaran || 'Belum Pilih'], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: "Transaksi berhasil disimpan!" });
    });
});

// Update Status Cucian & Status Pembayaran
app.put('/api/transaksi/:id', (req, res) => {
    const { id } = req.params;
    const { status_cucian, status_bayar, metode_pembayaran } = req.body;
    
    const sql = "UPDATE transaksi SET status_cucian = ?, status_bayar = ?, metode_pembayaran = ? WHERE id_transaksi = ?";
    db.query(sql, [status_cucian, status_bayar, metode_pembayaran, id], (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, message: "Data transaksi diperbarui!" });
    });
});

// Hapus Transaksi
app.delete('/api/transaksi/:id', (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM transaksi WHERE id_transaksi = ?", [id], (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, message: "Transaksi berhasil dihapus!" });
    });
});

// =================== API LAPORAN ===================

// Hitung Keuntungan Transaksi Minggu Ini
app.get('/api/laporan/mingguan', (req, res) => {
    // Menghitung total_harga yang status_bayar = 'Lunas' dalam 7 hari terakhir
    const sql = `
        SELECT SUM(total_harga) AS total_keuntungan 
        FROM transaksi 
        WHERE status_bayar = 'Lunas' AND tgl_masuk >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json({ total: results[0].total_keuntungan || 0 });
    });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server Backend berjalan di port ${PORT}`));