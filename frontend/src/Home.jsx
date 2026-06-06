import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Home() {
  const [resi, setResi] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!resi.trim()) return;
    
    setLoading(true);
    setErrorMsg('');
    setTrackResult(null);

    try {
      const res = await axios.get(`http://localhost:5000/api/track/${resi.trim()}`);
      if (res.data.success) {
        setTrackResult(res.data.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal mencari data. Pastikan resi benar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Navbar Minimalis */}
      <nav style={styles.navbar}>
        <h1 style={styles.logo}>Laundry<span style={{color: '#3b82f6'}}>Wangy</span></h1>
        <div style={styles.navLinks}>
          <Link to="/login" style={styles.linkText}>Masuk Admin</Link>
        </div>
      </nav>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <h1 style={styles.heroTitle}>Kasir Laundry</h1>
        
        <div style={styles.quoteBox}>
          <p style={styles.quoteText}>
            "Kerja jujur dan amanah <span style={{color: '#ef4444'}}>(korup gaji dipotong)</span><br/>
            Ke toko sebelah beli gurita, Pulangnya lewat jalan pintas. Jangan coba-coba<br/>
            manipulasi nota, Dompetmu kering digunting bos! slebewwww"
          </p>
        </div>

        {/* Fitur Tracking Customer */}
        <div style={styles.trackingSection}>
          <h3 style={styles.trackingTitle}>Cek Status Cucian Kamu</h3>
          <form onSubmit={handleTrack} style={styles.searchForm}>
            <input 
              type="text" 
              placeholder="Masukkan Kode Resi (Cth: LW-A1B2)" 
              value={resi}
              onChange={(e) => setResi(e.target.value.toUpperCase())}
              style={styles.searchInput}
            />
            <button type="submit" disabled={loading} style={styles.searchBtn}>
              {loading ? 'Mencari...' : 'Lacak'}
            </button>
          </form>

          {/* Tampilan Hasil Pencarian */}
          {errorMsg && <p style={styles.errorText}>{errorMsg}</p>}
          
          {trackResult && (
            <div style={styles.resultCard}>
              <div style={styles.resultHeader}>
                <span style={styles.resultBadge}>Resi: {trackResult.kode_resi}</span>
                <span style={{ 
                  ...styles.resultStatus, 
                  backgroundColor: trackResult.status_cucian === 'Selesai' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: trackResult.status_cucian === 'Selesai' ? '#34d399' : '#fbbf24'
                }}>
                  {trackResult.status_cucian.toUpperCase()}
                </span>
              </div>
              
              <div style={styles.resultGrid}>
                <div style={styles.resultItem}>
                  <small style={styles.resultLabel}>Pelanggan</small>
                  <strong style={styles.resultValue}>{trackResult.nama_pelanggan}</strong>
                </div>
                <div style={styles.resultItem}>
                  <small style={styles.resultLabel}>Layanan</small>
                  <strong style={styles.resultValue}>{trackResult.layanan} ({trackResult.berat}kg)</strong>
                </div>
                <div style={styles.resultItem}>
                  <small style={styles.resultLabel}>Pembayaran</small>
                  <strong style={{ 
                    ...styles.resultValue, 
                    color: trackResult.status_bayar === 'Lunas' ? '#34d399' : '#f87171' 
                  }}>
                    {trackResult.status_bayar}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    display: 'flex',
    flexDirection: 'column'
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 50px',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  },
  logo: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '800'
  },
  navLinks: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  },
  linkText: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'color 0.2s'
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 20px'
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: '800',
    marginBottom: '20px',
    textShadow: '0 4px 20px rgba(0,0,0,0.5)'
  },
  quoteBox: {
    backgroundColor: '#1e293b',
    padding: '24px 40px',
    borderRadius: '16px',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    maxWidth: '700px',
    textAlign: 'center',
    marginBottom: '50px'
  },
  quoteText: {
    color: '#94a3b8',
    lineHeight: '1.6',
    margin: 0,
    fontStyle: 'italic',
    fontSize: '15px'
  },
  trackingSection: {
    width: '100%',
    maxWidth: '500px',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: '30px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)'
  },
  trackingTitle: {
    marginTop: 0,
    marginBottom: '20px',
    fontSize: '18px',
    textAlign: 'center',
    color: '#60a5fa'
  },
  searchForm: {
    display: 'flex',
    gap: '10px'
  },
  searchInput: {
    flex: 1,
    padding: '14px 20px',
    borderRadius: '10px',
    border: '1px solid #334155',
    backgroundColor: '#0b0f19',
    color: '#fff',
    fontSize: '15px',
    outline: 'none'
  },
  searchBtn: {
    padding: '0 24px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  errorText: {
    color: '#f87171',
    textAlign: 'center',
    marginTop: '15px',
    fontSize: '14px'
  },
  resultCard: {
    marginTop: '25px',
    padding: '20px',
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    border: '1px solid #334155'
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px dashed #334155'
  },
  resultBadge: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff'
  },
  resultStatus: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  resultGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '15px'
  },
  resultItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  resultLabel: {
    color: '#64748b',
    fontSize: '12px',
    textTransform: 'uppercase'
  },
  resultValue: {
    color: '#e2e8f0',
    fontSize: '14px'
  }
};