import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Step 1: Input Email, Step 2: Input OTP & Password Baru
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Fungsi untuk meminta kode OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/forgot-password', { email });
      Swal.fire({
        icon: 'success',
        title: 'OTP Terkirim!',
        text: res.data.message,
        background: '#0f172a',
        color: '#fff',
        confirmButtonColor: '#3b82f6'
      });
      setStep(2); // Lanjut ke form input OTP
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.response?.data?.message || 'Terjadi kesalahan sistem',
        background: '#0f172a',
        color: '#fff',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mereset password dengan OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/reset-password', { 
        email, 
        otp, 
        newPassword 
      });
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: res.data.message,
        background: '#0f172a',
        color: '#fff',
        confirmButtonColor: '#10b981'
      }).then(() => {
        navigate('/login'); // Arahkan kembali ke halaman login
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mereset',
        text: err.response?.data?.message || 'OTP salah atau sudah kedaluwarsa',
        background: '#0f172a',
        color: '#fff',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Lupa Password</h2>
        <p style={styles.subtitle}>LAUNDRY WANGY</p>

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} style={styles.form}>
            <input
              type="email"
              placeholder="Masukkan Email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Mengirim...' : 'Kirim Kode OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={styles.form}>
            <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', margin: '0 0 15px 0' }}>
              Kode OTP telah dikirim ke <b>{email}</b>
            </p>
            <input
              type="text"
              placeholder="Masukkan 6 Digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength="6"
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Password Baru"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={styles.input}
            />
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Memproses...' : 'Simpan Password Baru'}
            </button>
          </form>
        )}

        <div style={styles.footer}>
          <Link to="/login" style={styles.link}>Kembali ke Login</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#0f172a',
    fontFamily: 'sans-serif'
  },
  card: {
    backgroundColor: '#1e293b',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    color: '#ffffff',
    textAlign: 'center',
    margin: '0 0 5px 0',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  subtitle: {
    color: '#3b82f6',
    textAlign: 'center',
    margin: '0 0 30px 0',
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '1px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  input: {
    padding: '14px',
    backgroundColor: '#0b0f19',
    border: '1px solid #334155',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none'
  },
  button: {
    padding: '14px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '15px',
    marginTop: '10px'
  },
  footer: {
    marginTop: '25px',
    textAlign: 'center'
  },
  link: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '13px'
  }
};