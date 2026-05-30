import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={styles.container}>
      
      <header style={styles.navbar}>
        <div style={styles.brandWrapper}>
          <h2 style={styles.logoText}>
            Laundry<span style={styles.logoAccent}>Wangy</span>
          </h2>
        </div>
        
        <div style={styles.navButtons}>
          <Link to="/login" style={styles.btnSecondary}>
            Masuk
          </Link>
          <Link to="/register" style={styles.btnPrimaryNav}>
            Daftar Akun
          </Link>
        </div>
      </header>

      <main style={styles.heroSection}>
        <div style={styles.contentWrapper}>
          <h1 style={styles.title}>Kasir Laundry</h1>
          
          <div style={styles.warningBox}>
            <p style={styles.subtitle}>
              "Kerja jujur dan amanah <span style={styles.alertText}>(korup gaji dipotong)</span><p>
              {`Ke toko sebelah beli gurita,
                Pulangnya lewat jalan pintas.
                Jangan coba-coba manipulasi nota,
                Dompetmu kering digunting bos! slebewwww`}
            </p>
            </p>
          </div>
        </div>
      </main>

    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'radial-gradient(circle at center, #1e293b 0%, #090d16 100%)', 
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 48px',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
  },
  brandWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  logoAccent: {
    color: '#3b82f6',
    marginLeft: '3px',
  },
  navButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  btnSecondary: {
    padding: '12px 24px',
    color: '#94a3b8', 
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'color 0.2s ease',
  },
  btnPrimaryNav: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '14px',
    boxShadow: '0 0 15px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(29, 78, 216, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  heroSection: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 24px 120px 24px', 
  },
  contentWrapper: {
    textAlign: 'center',
    maxWidth: '640px',
    width: '100%',
  },
  title: {
    color: '#ffffff',
    fontSize: '56px',
    fontWeight: '800',
    margin: '0 0 24px 0',
    letterSpacing: '-2px',
  },
  warningBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderLeft: '4px solid #3b82f6',
    padding: '20px 32px',
    borderRadius: '16px',
    display: 'inline-block',
    maxWidth: '100%',
    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '16px',
    lineHeight: '1.6',
    fontWeight: '500',
    fontStyle: 'italic',
    margin: 0,
  },
  alertText: {
    color: '#f87171',
    fontWeight: '600',
  }
};