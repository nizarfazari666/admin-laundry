import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2'; // <-- IMPORT SWEETALERT2

export default function Dashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [transaksi, setTransaksi] = useState([]);
  const [keuntungan, setKeuntungan] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  // --- FITUR BARU: STATE UNTUK MODAL DAFTAR PELANGGAN ---
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  
  const listLayanan = [
    { nama: 'Cuci Komplit (Reguler)', harga: 6000 },
    { nama: 'Cuci Kering Saja', harga: 5000 },
    { nama: 'Setrika Saja', harga: 4000 },
    { nama: 'Cuci Express 1 Hari', harga: 15000 }
  ];

  const [formData, setFormData] = useState({
    id_transaksi: null,
    nama_pelanggan: '',
    no_hp: '',
    layanan: '',
    berat: '',
    total_harga: 0,
    status_bayar: 'Belum Lunas',
    metode_pembayaran: '',
    status_cucian: 'Antri'
  });

  useEffect(() => {
    try {
      const user = localStorage.getItem('admin_user');
      if (!user || user === "undefined") {
        navigate('/login');
      } else {
        setAdmin(JSON.parse(user));
        fetchData();
      }
    } catch (error) {
      console.error("Gagal membaca session login:", error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchData = async () => {
    try {
      const resTrans = await axios.get('http://localhost:5000/api/transaksi');
      setTransaksi(Array.isArray(resTrans.data) ? resTrans.data : []);
      
      const resLap = await axios.get('http://localhost:5000/api/laporan/mingguan');
      setKeuntungan(resLap.data?.total || 0);
    } catch (err) {
      console.error("Gagal mengambil data dari API backend:", err);
    }
  };

  // --- UPDATE: SWEETALERT UNTUK LOGOUT ---
  const handleLogout = () => {
    Swal.fire({
      title: 'Yakin ingin keluar?',
      text: "Sesi kasir Anda akan diakhiri.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Ya, Logout',
      cancelButtonText: 'Batal',
      background: '#0f172a',
      color: '#fff'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('admin_user');
        navigate('/login');
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'layanan' || name === 'berat') {
        const selected = listLayanan.find(l => l.nama === newData.layanan);
        newData.total_harga = (selected ? selected.harga : 0) * (parseFloat(newData.berat) || 0);
      }
      return newData;
    });
  };

  // --- UPDATE: SWEETALERT UNTUK SUBMIT FORM ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.metode_pembayaran && formData.status_bayar === 'Lunas') {
        return Swal.fire({
          icon: 'warning',
          title: 'Perhatian!',
          text: 'Pilih metode pembayaran jika status Lunas!',
          background: '#0f172a',
          color: '#fff',
          confirmButtonColor: '#3b82f6'
        });
    }

    try {
      if (isEdit) {
        await axios.put(`http://localhost:5000/api/transaksi/${formData.id_transaksi}`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Transaksi berhasil diupdate!',
          background: '#0f172a',
          color: '#fff',
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        await axios.post('http://localhost:5000/api/transaksi', formData);
        Swal.fire({
          icon: 'success',
          title: 'Tersimpan',
          text: 'Transaksi baru berhasil ditambahkan!',
          background: '#0f172a',
          color: '#fff',
          showConfirmButton: false,
          timer: 1500
        });
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Terjadi kesalahan saat menyimpan transaksi!',
        background: '#0f172a',
        color: '#fff',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleEdit = (t) => {
    setFormData(t);
    setIsEdit(true);
    setShowModal(true);
  };

  // --- UPDATE: SWEETALERT UNTUK DELETE ---
  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Hapus transaksi ini?',
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      background: '#0f172a',
      color: '#fff'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/api/transaksi/${id}`);
          Swal.fire({
            icon: 'success',
            title: 'Terhapus!',
            text: 'Data transaksi berhasil dihapus.',
            background: '#0f172a',
            color: '#fff',
            showConfirmButton: false,
            timer: 1500
          });
          fetchData();
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: 'Terjadi kesalahan saat menghapus data.',
            background: '#0f172a',
            color: '#fff',
            confirmButtonColor: '#ef4444'
          });
        }
      }
    });
  };

  const openInputBaru = () => {
    setFormData({ id_transaksi: null, nama_pelanggan: '', no_hp: '', layanan: '', berat: '', total_harga: 0, status_bayar: 'Belum Lunas', metode_pembayaran: '', status_cucian: 'Antri' });
    setIsEdit(false);
    setShowModal(true);
  };

  const handleCetak = (data) => {
    setInvoiceData(data);
    setTimeout(() => {
        window.print();
        setInvoiceData(null);
    }, 500);
  };

  // --- FITUR BARU: MENGELOMPOKKAN DAFTAR PELANGGAN DARI TRANSAKSI ---
  const daftarPelanggan = transaksi.reduce((acc, curr) => {
    const isExist = acc.find(p => p.nama_pelanggan.toLowerCase() === curr.nama_pelanggan.toLowerCase() && p.no_hp === curr.no_hp);
    if (!isExist) {
      acc.push({ nama_pelanggan: curr.nama_pelanggan, no_hp: curr.no_hp, total_transaksi: 1 });
    } else {
      isExist.total_transaksi += 1;
    }
    return acc;
  }, []);

  if (loading || !admin) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff', fontFamily: 'sans-serif', backgroundColor: '#1a202c' }}>
        <h3>Memuat Data Autentikasi Dasbor...</h3>
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer}>
      
      {/* HEADER & PROFIL */}
      <div className="no-print" style={styles.headerNavbar}>
        <h2 style={styles.headerLogo}>Laundry Admin/Kasir</h2>
        <div style={styles.profileSection}>
          <span style={styles.adminGreeting}>Halo Admin, <b style={styles.adminName}>{admin.nama || 'Admin'}</b></span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* LAPORAN MINGGUAN */}
      <div className="no-print" style={styles.revenueCard}>
        <div style={styles.cardGradientOverlay}></div>
        <h3 style={styles.cardLabel}>Total Pendapatan (7 Hari Terakhir)</h3>
        <h1 style={styles.cardMainValue}>Rp {Number(keuntungan || 0).toLocaleString('id-ID')}</h1>
      </div>

      {/* TABEL TRANSAKSI */}
      <div className="no-print" style={styles.tableWrapperCard}>
        <div style={styles.tableHeaderZone}>
          <h3 style={styles.tableTitle}>Daftar Transaksi Offline</h3>
          
          {/* MODIFIKASI: BUNGKUS DENGAN DIV AGAR BISA 2 TOMBOL BERSEBELAHAN TANPA HAPUS KODE LAMA */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowCustomerModal(true)} style={styles.customerListBtn}>👥 Daftar Pelanggan</button>
            <button onClick={openInputBaru} style={styles.inputTransaksiBtn}>+ Input Transaksi</button>
          </div>
        </div>

        <table style={styles.mainTableStructure}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.tableHeaderCell}>ID/Tgl</th>
              <th style={styles.tableHeaderCell}>Pelanggan</th>
              <th style={styles.tableHeaderCell}>Layanan</th>
              <th style={styles.tableHeaderCell}>Total (Rp)</th>
              <th style={styles.tableHeaderCell}>Status</th>
              <th style={styles.tableHeaderCell}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transaksi.length === 0 ? (
              <tr>
                <td colSpan="6" style={styles.emptyDataCell}>Belum ada data transaksi offline.</td>
              </tr>
            ) : (
              transaksi.map((t) => (
                <tr key={t.id_transaksi} style={styles.tableBodyRow}>
                  <td style={styles.tableBodyCell}>
                    <span style={styles.textHighlight}>#{t.id_transaksi}</span><br/>
                    <small style={styles.subtextDim}>{t.tgl_masuk ? new Date(t.tgl_masuk).toLocaleDateString('id-ID') : '-'}</small>
                  </td>
                  <td style={styles.tableBodyCell}>
                    <b style={styles.textMainBold}>{t.nama_pelanggan}</b><br/>
                    <small style={styles.subtextDim}>{t.no_hp}</small>
                  </td>
                  <td style={styles.tableBodyCell_Normal}>{t.layanan} ({t.berat} Kg)</td>
                  <td style={styles.tableBodyCell_Price}>{Number(t.total_harga || 0).toLocaleString('id-ID')}</td>
                  <td style={styles.tableBodyCell}>
                    <span style={{ color: t.status_bayar === 'Lunas' ? '#10b981' : '#f87171', fontWeight: '700', fontSize: '13px' }}>{t.status_bayar}</span><br/>
                    <small style={styles.statusCucianBadge}>{t.status_cucian}</small>
                  </td>
                  <td style={styles.actionButtonContainer}>
                    <button onClick={() => handleEdit(t)} style={styles.actionBtnEdit}>Edit</button>
                    <button onClick={() => handleDelete(t.id_transaksi)} style={styles.actionBtnDelete}>Hapus</button>
                    <button onClick={() => handleCetak(t)} style={styles.actionBtnPrint}>Cetak</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- FITUR BARU: MODAL DAFTAR PELANGGAN --- */}
      {showCustomerModal && (
        <div className="no-print" style={styles.modalBackdrop}>
          <div style={{ ...styles.modalContainerCard, width: '500px' }}>
            <h3 style={styles.modalTitleText}>Daftar Pelanggan</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '20px', paddingRight: '10px' }}>
              <table style={styles.mainTableStructure}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.tableHeaderCell}>Nama Pelanggan</th>
                    <th style={styles.tableHeaderCell}>Kontak</th>
                    <th style={styles.tableHeaderCell}>Total Order</th>
                  </tr>
                </thead>
                <tbody>
                  {daftarPelanggan.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={styles.emptyDataCell}>Belum ada data pelanggan tercatat.</td>
                    </tr>
                  ) : (
                    daftarPelanggan.map((p, index) => (
                      <tr key={index} style={styles.tableBodyRow}>
                        <td style={styles.tableBodyCell}><b style={styles.textMainBold}>{p.nama_pelanggan}</b></td>
                        <td style={styles.tableBodyCell}><span style={styles.subtextDim}>{p.no_hp}</span></td>
                        <td style={styles.tableBodyCell}><span style={styles.statusCucianBadge}>{p.total_transaksi}x Transaksi</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={() => setShowCustomerModal(false)} style={{ ...styles.modalCancelBtn, width: '100%' }}>Tutup Daftar</button>
          </div>
        </div>
      )}

      {/* MODAL INPUT / EDIT */}
      {showModal && (
        <div className="no-print" style={styles.modalBackdrop}>
          <div style={styles.modalContainerCard}>
            <h3 style={styles.modalTitleText}>{isEdit ? 'Ubah Transaksi' : 'Input Transaksi Baru'}</h3>
            <form onSubmit={handleSubmit} style={styles.modalFormStructure}>
              <input type="text" name="nama_pelanggan" placeholder="Nama Pelanggan" value={formData.nama_pelanggan} onChange={handleInputChange} required style={inputStyle} />
              <input type="text" name="no_hp" placeholder="Nomor HP" value={formData.no_hp} onChange={handleInputChange} required style={inputStyle} />
              
              <select name="layanan" value={formData.layanan} onChange={handleInputChange} required style={inputStyle}>
                <option value="" style={styles.darkOption}>-- Pilih Layanan --</option>
                {listLayanan.map(l => <option key={l.nama} value={l.nama} style={styles.darkOption}>{l.nama} (Rp {l.harga}/kg)</option>)}
              </select>
              
              <input type="number" name="berat" placeholder="Berat (Kg)" value={formData.berat} onChange={handleInputChange} required style={inputStyle} />
              
              <div style={styles.modalTotalDisplayBox}>
                Total Harga: Rp {Number(formData.total_harga || 0).toLocaleString('id-ID')}
              </div>

              {isEdit && (
                <select name="status_cucian" value={formData.status_cucian} onChange={handleInputChange} style={inputStyle}>
                  <option value="Antri" style={styles.darkOption}>Antri</option>
                  <option value="Dicuci" style={styles.darkOption}>Proses Dicuci</option>
                  <option value="Selesai" style={styles.darkOption}>Cucian Selesai</option>
                </select>
              )}

              <select name="status_bayar" value={formData.status_bayar} onChange={handleInputChange} style={inputStyle}>
                <option value="Belum Lunas" style={styles.darkOption}>Belum Lunas</option>
                <option value="Lunas" style={styles.darkOption}>Lunas (Bayar Sekarang)</option>
              </select>

              {formData.status_bayar === 'Lunas' && (
                  <select name="metode_pembayaran" value={formData.metode_pembayaran} onChange={handleInputChange} required style={inputStyle}>
                    <option value="" style={styles.darkOption}>-- Pilih Pembayaran --</option>
                    <option value="CASH" style={styles.darkOption}>Tunai (Cash)</option>
                    <option value="QRIS" style={styles.darkOption}>QRIS / E-Wallet</option>
                    <option value="TRANSFER" style={styles.darkOption}>Transfer Bank</option>
                  </select>
              )}

              <div style={styles.modalActionButtonsZone}>
                <button type="submit" style={styles.modalSubmitBtn}>Simpan</button>
                <button type="button" onClick={() => setShowModal(false)} style={styles.modalCancelBtn}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CETAK STRUK */}
      {invoiceData && (
        <div id="print-area" style={{ padding: '20px', width: '300px', border: '1px solid black', fontFamily: 'monospace', color: '#000', backgroundColor: '#fff' }}>
          <h2 style={{ textAlign: 'center', margin: 0 }}>STRUK</h2>
          <p style={{ textAlign: 'center', fontSize: '12px', margin: '5px 0' }}>Solusi Cepat & Bersih</p>
          <hr style={{ borderTop: '1px dashed black' }} />
          <p>Tgl : {invoiceData.tgl_masuk ? new Date(invoiceData.tgl_masuk).toLocaleString('id-ID') : '-'}</p>
          <p>No  : #{invoiceData.id_transaksi}</p>
          <p>Nama: {invoiceData.nama_pelanggan}</p>
          <hr style={{ borderTop: '1px dashed black' }} />
          <p>{invoiceData.layanan}</p>
          <p>Berat: {invoiceData.berat} Kg</p>
          <h3 style={{ margin: '10px 0' }}>TOTAL: Rp {Number(invoiceData.total_harga || 0).toLocaleString('id-ID')}</h3>
          <hr style={{ borderTop: '1px dashed black' }} />
          <p>Status : {invoiceData.status_bayar} ({invoiceData.metode_pembayaran || 'CASH'})</p>
          <p style={{ textAlign: 'center', marginTop: '20px' }}>*** Terima Kasih ***</p>
        </div>
      )}

      {/* CSS KHUSUS PRINT */}
      <style>{`
        #print-area { display: none; }
        @media print {
          .no-print { display: none !important; }
          body { background-color: white !important; margin: 0; padding: 0; }
          #print-area { display: block !important; position: absolute; left: 0; top: 0; }
        }
      `}</style>
    </div>
  );
}

// PREMIUM MATTE-OBSIDIAN DASHBOARD STYLESHEET
const styles = {
  dashboardContainer: { 
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif', 
    padding: '32px 40px', 
    background: 'radial-gradient(circle at center, #1e293b 0%, #090d16 100%)', 
    minHeight: '100vh', 
    color: '#f8fafc' 
  },
  headerNavbar: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: 'rgba(15, 23, 42, 0.6)', 
    backdropFilter: 'blur(16px)',
    padding: '18px 28px', 
    borderRadius: '16px', 
    marginBottom: '28px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)'
  },
  headerLogo: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    color: '#ffffff'
  },
  logoAccent: {
    color: '#3b82f6',
    fontWeight: '900'
  },
  profileSection: { 
    display: 'flex', 
    gap: '24px', 
    alignItems: 'center' 
  },
  adminGreeting: {
    color: '#94a3b8',
    fontSize: '15px'
  },
  adminName: {
    color: '#ffffff',
    fontWeight: '600'
  },
  logoutBtn: { 
    padding: '10px 20px', 
    backgroundColor: 'rgba(239, 68, 68, 0.1)', 
    color: '#f87171', 
    border: '1px solid rgba(239, 68, 68, 0.2)', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontWeight: '600',
    fontSize: '13px',
    transition: 'all 0.2s ease',
  },
  revenueCard: { 
    position: 'relative',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)', 
    color: 'white', 
    padding: '32px', 
    borderRadius: '20px', 
    marginBottom: '28px', 
    textAlign: 'center',
    overflow: 'hidden',
    boxShadow: '0 12px 24px -10px rgba(29, 78, 216, 0.5), 0 0 20px rgba(59, 130, 246, 0.2)'
  },
  cardGradientOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)',
    pointerEvents: 'none'
  },
  cardLabel: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '1px',
    color: '#93c5fd',
    textTransform: 'uppercase'
  },
  cardMainValue: { 
    margin: '12px 0 0 0',
    fontSize: '42px',
    fontWeight: '800',
    letterSpacing: '-1px'
  },
  tableWrapperCard: { 
    backgroundColor: 'rgba(15, 23, 42, 0.4)', 
    backdropFilter: 'blur(16px)',
    padding: '28px', 
    borderRadius: '20px', 
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
  },
  tableHeaderZone: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: '20px' 
  },
  tableTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff'
  },
  customerListBtn: {
    padding: '12px 24px', 
    background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', 
    color: 'white', 
    border: 'none', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontWeight: '700',
    fontSize: '14px',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
  },
  inputTransaksiBtn: { 
    padding: '12px 24px', 
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
    color: 'white', 
    border: 'none', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontWeight: '700',
    fontSize: '14px',
    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
  },
  mainTableStructure: { 
    width: '100%', 
    borderCollapse: 'separate',
    borderSpacing: '0 8px'
  },
  tableHeaderRow: { 
    textAlign: 'left' 
  },
  tableHeaderCell: { 
    padding: '14px 16px', 
    color: '#64748b',
    fontWeight: '700',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '2px solid #1e293b'
  },
  tableBodyRow: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    transition: 'all 0.2s ease'
  },
  tableBodyCell: { 
    padding: '16px', 
    borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
    fontSize: '14px',
    verticalAlign: 'middle'
  },
  tableBodyCell_Normal: {
    padding: '16px', 
    borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
    fontSize: '14px',
    color: '#cbd5e1',
    verticalAlign: 'middle'
  },
  tableBodyCell_Price: {
    padding: '16px', 
    borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
    fontSize: '15px',
    fontWeight: '700',
    color: '#ffffff',
    verticalAlign: 'middle'
  },
  textHighlight: {
    color: '#60a5fa',
    fontWeight: '700'
  },
  subtextDim: {
    color: '#64748b',
    fontSize: '12px'
  },
  textMainBold: {
    color: '#ffffff',
    fontSize: '15px'
  },
  statusCucianBadge: {
    color: '#3b82f6', 
    fontWeight: '700',
    fontSize: '11px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: '2px 6px',
    borderRadius: '4px',
    display: 'inline-block',
    marginTop: '4px'
  },
  emptyDataCell: { 
    padding: '40px', 
    textAlign: 'center', 
    color: '#64748b',
    fontSize: '15px',
    backgroundColor: 'rgba(30, 41, 59, 0.1)',
    borderRadius: '12px'
  },
  actionButtonContainer: {
    padding: '16px', 
    display: 'flex', 
    gap: '8px', // Menambah jarak antar tombol
    verticalAlign: 'middle',
    alignItems: 'center'
  },
  // PENYESUAIAN UKURAN TOMBOL ACTION
  actionBtnEdit: { 
    padding: '10px 16px', // Lebih besar
    backgroundColor: 'rgba(234, 179, 8, 0.1)', 
    color: '#eab308',
    border: '1px solid rgba(234, 179, 8, 0.2)', 
    borderRadius: '8px', // Disesuaikan proporsi
    cursor: 'pointer', 
    fontWeight: '600',
    fontSize: '14px' // Text lebih besar agar jelas
  },
  actionBtnDelete: { 
    padding: '10px 16px', // Lebih besar
    backgroundColor: 'rgba(239, 68, 68, 0.1)', 
    color: '#f87171', 
    border: '1px solid rgba(239, 68, 68, 0.2)', 
    borderRadius: '8px', // Disesuaikan proporsi
    cursor: 'pointer', 
    fontWeight: '600',
    fontSize: '14px' // Text lebih besar agar jelas
  },
  actionBtnPrint: { 
    padding: '10px 16px', // Lebih besar
    backgroundColor: 'rgba(16, 185, 129, 0.1)', 
    color: '#34d399', 
    border: '1px solid rgba(16, 185, 129, 0.2)', 
    borderRadius: '8px', // Disesuaikan proporsi
    cursor: 'pointer', 
    fontWeight: '600',
    fontSize: '14px' // Text lebih besar agar jelas
  },
  
  modalBackdrop: { 
    position: 'fixed', 
    top: 0, left: 0, right: 0, bottom: 0, 
    backgroundColor: 'rgba(0, 0, 0, 0.7)', 
    backdropFilter: 'blur(8px)',
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 999 
  },
  modalContainerCard: { 
    backgroundColor: '#0f172a', 
    padding: '36px', 
    borderRadius: '24px', 
    width: '420px', 
    color: '#f8fafc',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
  },
  modalTitleText: { 
    marginTop: 0,
    marginBottom: '24px',
    fontSize: '22px',
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: '-0.5px'
  },
  modalFormStructure: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '16px' 
  },
  darkOption: {
    backgroundColor: '#0f172a',
    color: '#ffffff'
  },
  modalTotalDisplayBox: { 
    padding: '16px', 
    backgroundColor: '#0b0f19', 
    borderRadius: '12px',
    fontWeight: '700', 
    textAlign: 'center', 
    color: '#60a5fa',
    fontSize: '15px',
    border: '1px solid rgba(59, 130, 246, 0.2)'
  },
  modalActionButtonsZone: { 
    display: 'flex', 
    gap: '12px', 
    marginTop: '12px' 
  },
  modalSubmitBtn: { 
    flex: 1, 
    padding: '14px', 
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
    color: 'white', 
    border: 'none', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontWeight: '700',
    fontSize: '14px'
  },
  modalCancelBtn: { 
    flex: 1, 
    padding: '14px', 
    backgroundColor: 'rgba(255, 255, 255, 0.03)', 
    color: '#94a3b8', 
    border: '1px solid rgba(255, 255, 255, 0.05)', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontWeight: '600',
    fontSize: '14px'
  }
};

const inputStyle = { 
  padding: '14px 16px', 
  backgroundColor: '#0b0f19', 
  border: '1px solid #1e293b', 
  borderRadius: '12px', 
  fontSize: '14px', 
  color: '#ffffff',
  width: '100%', 
  boxSizing: 'border-box',
  outline: 'none',
  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
};