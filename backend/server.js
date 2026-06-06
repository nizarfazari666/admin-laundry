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
    database: "laundry_admin_only"
});

db.connect((err) => {
    if (err) console.error('Database connection failed:', err);
    else console.log('Terkoneksi ke Database MySQL');
});

// 2. KONFIGURASI EMAIL (Untuk Lupa Password)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'priamalam27@gmail.com', // Ganti dengan emailmu
        pass: 'qomo dbyy bont tpsz' // Ganti dengan App Password 16 digit (tanpa spasi)
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

// Tampil Semua Transaksi (Pakai JOIN untuk mengambil nama dari tabel pelanggan)
app.get('/api/transaksi', (req, res) => {
    const sql = `
        SELECT t.*, p.nama_pelanggan, p.no_hp 
        FROM transaksi t 
        JOIN pelanggan p ON t.id_pelanggan = p.id_pelanggan 
        ORDER BY t.tgl_masuk DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Input Transaksi Baru (Relasional)
app.post('/api/transaksi', (req, res) => {
    const { nama_pelanggan, no_hp, layanan, berat, total_harga, status_bayar, metode_pembayaran, status_cucian } = req.body;

    // 1. Cek apakah pelanggan sudah ada di tabel 'pelanggan'
    const checkPelanggan = "SELECT id_pelanggan FROM pelanggan WHERE nama_pelanggan = ? AND no_hp = ?";
    db.query(checkPelanggan, [nama_pelanggan, no_hp], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        if (results.length > 0) {
            // Pelanggan sudah ada, ambil id_pelanggan nya
            insertTransaksi(results[0].id_pelanggan, res, req.body);
        } else {
            // Pelanggan belum ada, buat data pelanggan baru
            const insertPelanggan = "INSERT INTO pelanggan (nama_pelanggan, no_hp) VALUES (?, ?)";
            db.query(insertPelanggan, [nama_pelanggan, no_hp], (err, resultInsert) => {
                if (err) return res.status(500).json({ success: false, message: err.message });
                // Ambil id_pelanggan yang baru saja dibuat (insertId)
                insertTransaksi(resultInsert.insertId, res, req.body);
            });
        }
    });
});

// Fungsi pembantu untuk insert ke tabel transaksi
function insertTransaksi(id_pelanggan, res, data) {
    // Generate kode unik acak, contoh: LW-9F2A
    const kode_resi = 'LW-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    const sql = "INSERT INTO transaksi (kode_resi, id_pelanggan, layanan, berat, total_harga, status_bayar, metode_pembayaran, status_cucian) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [
        kode_resi, // Masukkan kode resi di awal
        id_pelanggan, 
        data.layanan, 
        data.berat, 
        data.total_harga, 
        data.status_bayar || 'Belum Lunas', 
        data.metode_pembayaran || '', 
        data.status_cucian || 'Antri'
    ], (err) => {
        if (err) {
            console.error("Gagal Insert Transaksi:", err);
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: "Transaksi berhasil disimpan!", kode_resi: kode_resi });
    });
}

// Update Transaksi
app.put('/api/transaksi/:id', (req, res) => {
    const { id } = req.params;
    const { layanan, berat, total_harga, status_cucian, status_bayar, metode_pembayaran } = req.body;
    
    // Perhatikan: Kita hanya mengupdate data transaksi, data pelanggan tidak diubah dari sini
    const sql = "UPDATE transaksi SET layanan = ?, berat = ?, total_harga = ?, status_cucian = ?, status_bayar = ?, metode_pembayaran = ? WHERE id_transaksi = ?";
    
    db.query(sql, [layanan, berat, total_harga, status_cucian, status_bayar, metode_pembayaran, id], (err) => {
        if (err) {
            console.error("Gagal Update Transaksi:", err);
            return res.status(500).json({ success: false, message: err.message });
        }
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

// API Publik: Lacak Status Laundry berdasarkan Kode Resi
app.get('/api/track/:resi', (req, res) => {
    const { resi } = req.params;
    const sql = `
        SELECT t.kode_resi, t.layanan, t.berat, t.total_harga, t.status_bayar, t.status_cucian, t.tgl_masuk, p.nama_pelanggan 
        FROM transaksi t
        JOIN pelanggan p ON t.id_pelanggan = p.id_pelanggan
        WHERE t.kode_resi = ?
    `;
    
    db.query(sql, [resi], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
        if (results.length > 0) {
            res.json({ success: true, data: results[0] });
        } else {
            res.status(404).json({ success: false, message: "Resi tidak ditemukan!" });
        }
    });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server Backend berjalan di port ${PORT}`));