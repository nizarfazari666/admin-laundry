import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Register() {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/register', { nama, email, password });
      if (res.data.success) {
        Swal.fire({
          title: 'Registrasi Berhasil!',
          text: 'Akun telah dibuat. Silakan Login.',
          icon: 'success',
          background: '#0f172a',
          color: '#ffffff',
          confirmButtonColor: '#3b82f6'
        }).then(() => {
          navigate('/login');
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'Registrasi Gagal!',
        text: err.response?.data?.message || 'Daftar gagal! Email mungkin sudah digunakan.',
        icon: 'error',
        background: '#0f172a',
        color: '#ffffff',
        confirmButtonColor: '#e53e3e'
      });
    }
  };

   return (
    <div style={styles.fullscreenContainer}>
      <div style={styles.registerCard}>
        
        <div style={styles.topBarAccent}></div>

        <div style={styles.headerZone}>
          <h2 style={styles.mainTitle}>Daftar Akun</h2>
          <div style={styles.brandSubtitle}>LAUNDRY WANGY SYSTEM</div>
        </div>
        
        <form onSubmit={handleRegister} style={styles.formStructure}>
          <div style={styles.fieldWrapper}>
            <input 
              type="text" 
              placeholder="Nama Ta" 
              required 
              value={nama} 
              onChange={e => setNama(e.target.value)} 
              style={styles.premiumInput} 
            />
          </div>

          <div style={styles.fieldWrapper}>
            <input 
              type="email" 
              placeholder="Email Ta" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              style={styles.premiumInput} 
            />
          </div>
          
          <div style={styles.fieldWrapper}>
            <input 
              type="password" 
              placeholder="Buat Password Ta" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              style={styles.premiumInput} 
            />
          </div>
          
          <button type="submit" style={styles.glowingBtn}>
            Daftar Sekarang →
          </button>
        </form>
        
        <div style={styles.utilityZone}>
          <p style={styles.loginContainer}>
            Sudah punya akun? <Link to="/login" style={styles.neonLoginLink}>Login di sini</Link>
          </p>
        </div>

      </div>
    </div>
  );
}

const styles = {
  fullscreenContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'radial-gradient(circle at center, #1e293b 0%, #090d16 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
    padding: '24px',
  },
  registerCard: {
    position: 'relative',
    backgroundColor: 'rgba(15, 23, 42, 0.6)', 
    backdropFilter: 'blur(16px)', 
    padding: '56px 48px',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid rgba(255, 255, 255, 0.05)', 
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
  },
  topBarAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)', 
  },
  headerZone: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  mainTitle: {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: '800',
    margin: '0 0 6px 0',
    letterSpacing: '-1px',
  },
  brandSubtitle: {
    color: '#60a5fa', 
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '2px', 
  },
  formStructure: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  fieldWrapper: {
    width: '100%',
  },
  premiumInput: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#0b0f19', 
    border: '1px solid #1e293b',
    borderRadius: '14px',
    fontSize: '15px',
    color: '#ffffff',
    boxSizing: 'border-box',
    outline: 'none',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
  },
  glowingBtn: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
    color: '#ffffff',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '15px',
    letterSpacing: '0.2px',
    marginTop: '8px',
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(29, 78, 216, 0.3)',
  },
  utilityZone: {
    textAlign: 'center',
    marginTop: '28px',
  },
  loginContainer: {
    margin: 0,
    fontSize: '14px',
    color: '#475569',
    fontWeight: '500',
  },
  neonLoginLink: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '700',
  }
};