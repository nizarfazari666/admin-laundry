import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('admin_user', JSON.stringify(res.data.user));
        alert('Login Berhasil!');
        navigate('/dashboard'); 
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Login gagal! Periksa email dan password.');
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#2b6cb0' }}>Login Admin / Kasir</h2>
      <form onSubmit={handleLogin} style={formStyle}>
        <input type="email" placeholder="Masukkan Email" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Masukkan Password" required value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
        <button type="submit" style={btnStyle}>Masuk Sistem</button>
      </form>
      <p style={{ marginTop: '15px', fontSize: '14px' }}>
        <span style={{ color: 'gray', cursor: 'pointer', textDecoration: 'underline' }}>Lupa Password?</span>
      </p>
      <p style={{ fontSize: '14px' }}>
        Belum punya akun? <Link to="/register" style={{ color: '#3182ce' }}>Daftar di sini</Link>
      </p>
    </div>
  );
}

const containerStyle = { textAlign: 'center', marginTop: '80px', fontFamily: 'sans-serif' };
const formStyle = { display: 'flex', flexDirection: 'column', width: '320px', margin: '0 auto', gap: '15px' };
const inputStyle = { padding: '12px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px' };
const btnStyle = { padding: '12px', backgroundColor: '#3182ce', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };