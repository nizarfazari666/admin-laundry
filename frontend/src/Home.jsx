import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#2b6cb0' }}>Aplikasi Kasir Laundry (Offline POS)</h1>
      <p style={{ color: '#4a5568', marginBottom: '30px' }}>
        Sistem pencatatan transaksi kasir khusus admin dan karyawan.
      </p>
      <div>
        <Link to="/login" style={btnStyle}>Masuk (Login)</Link>
        <Link to="/register" style={{ ...btnStyle, backgroundColor: '#4a5568' }}>Daftar Akun</Link>
      </div>
    </div>
  );
}

const btnStyle = {
  padding: '12px 25px',
  margin: '10px',
  backgroundColor: '#3182ce',
  color: '#fff',
  textDecoration: 'none',
  borderRadius: '5px',
  fontWeight: 'bold'
};