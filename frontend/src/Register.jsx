import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

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
        alert('Pendaftaran Berhasil! Silakan Login.');
        navigate('/login');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Daftar gagal! Email mungkin sudah digunakan.');
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#2b6cb0' }}>Pendaftaran Akun Baru</h2>
      <form onSubmit={handleRegister} style={formStyle}>
        <input type="text" placeholder="Nama Lengkap Karyawan" required value={nama} onChange={e => setNama(e.target.value)} style={inputStyle} />
        <input type="email" placeholder="Email Akun" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Buat Password" required value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
        <button type="submit" style={btnStyle}>Daftar Sekarang</button>
      </form>
      <p style={{ marginTop: '15px', fontSize: '14px' }}>
        Sudah punya akun? <Link to="/login" style={{ color: '#3182ce' }}>Login di sini</Link>
      </p>
    </div>
  );
}

const containerStyle = { textAlign: 'center', marginTop: '80px', fontFamily: 'sans-serif' };
const formStyle = { display: 'flex', flexDirection: 'column', width: '320px', margin: '0 auto', gap: '15px' };
const inputStyle = { padding: '12px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px' };
const btnStyle = { padding: '12px', backgroundColor: '#48bb78', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };