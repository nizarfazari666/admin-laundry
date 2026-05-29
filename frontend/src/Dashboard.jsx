import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [transaksi, setTransaksi] = useState([]);
  const [keuntungan, setKeuntungan] = useState(0);
  const [loading, setLoading] = useState(true); // Tambahkan state loading untuk melacak proses
  
  // State untuk Modal & Form
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  
  const listLayanan = [
  { nama: 'Cuci Komplit (Reguler)', harga: 6000 },
  { nama: 'Cuci Kering Saja', harga: 5000 },
  { nama: 'Setrika Saja', harga: 4000 }, // <--- UBAH JADI HARGA
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
      // Pastikan data yang masuk selalu berbentuk Array
      setTransaksi(Array.isArray(resTrans.data) ? resTrans.data : []);
      
      const resLap = await axios.get('http://localhost:5000/api/laporan/mingguan');
      setKeuntungan(resLap.data?.total || 0);
    } catch (err) {
      console.error("Gagal mengambil data dari API backend:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    navigate('/login');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.metode_pembayaran && formData.status_bayar === 'Lunas') {
        return alert('Pilih metode pembayaran jika status Lunas!');
    }

    try {
      if (isEdit) {
        await axios.put(`http://localhost:5000/api/transaksi/${formData.id_transaksi}`, formData);
        alert('Transaksi berhasil diupdate!');
      } else {
        await axios.post('http://localhost:5000/api/transaksi', formData);
        alert('Transaksi baru berhasil ditambahkan!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Terjadi kesalahan saat menyimpan transaksi!');
    }
  };

  const handleEdit = (t) => {
    setFormData(t);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
      await axios.delete(`http://localhost:5000/api/transaksi/${id}`);
      fetchData();
    }
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

  // JIKA SEDANG LOADING ATAU DATA ADMIN BELUM SIAP, BERIKAN TEKS AGAR TIDAK BLANK HITAM
  if (loading || !admin) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff', fontFamily: 'sans-serif', backgroundColor: '#1a202c' }}>
        <h3>Memuat Data Autentikasi Dasbor...</h3>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px', backgroundColor: '#f7fafc', minHeight: '100vh', color: '#2d3748' }}>
      
      {/* HEADER & PROFIL */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2b6cb0', color: 'white', padding: '15px 20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>Laundry Admin POS</h2>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span>Halo, <b>{admin.nama || 'Admin'}</b></span>
          <button onClick={handleLogout} style={{ padding: '8px 15px', backgroundColor: '#e53e3e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
        </div>
      </div>

      {/* LAPORAN MINGGUAN */}
      <div className="no-print" style={{ backgroundColor: '#48bb78', color: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
        <h3>Total Pendapatan (7 Hari Terakhir)</h3>
        {/* FIX: Konversi paksa ke Number agar .toLocaleString() tidak error */}
        <h1 style={{ margin: '10px 0' }}>Rp {Number(keuntungan || 0).toLocaleString('id-ID')}</h1>
      </div>

      {/* TABEL TRANSAKSI */}
      <div className="no-print" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h3>Daftar Transaksi Offline</h3>
          <button onClick={openInputBaru} style={{ padding: '10px 20px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>+ Input Transaksi</button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#edf2f7', textAlign: 'left' }}>
              <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e0' }}>ID/Tgl</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e0' }}>Pelanggan</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e0' }}>Layanan</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e0' }}>Total (Rp)</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e0' }}>Status</th>
              <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e0' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {transaksi.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'gray' }}>Belum ada data transaksi offline.</td>
              </tr>
            ) : (
              transaksi.map((t) => (
                <tr key={t.id_transaksi} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px' }}>#{t.id_transaksi}<br/><small>{t.tgl_masuk ? new Date(t.tgl_masuk).toLocaleDateString('id-ID') : '-'}</small></td>
                  <td style={{ padding: '10px' }}><b>{t.nama_pelanggan}</b><br/><small>{t.no_hp}</small></td>
                  <td style={{ padding: '10px' }}>{t.layanan} ({t.berat} Kg)</td>
                  {/* FIX: Konversi paksa ke Number agar aman */}
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{Number(t.total_harga || 0).toLocaleString('id-ID')}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ color: t.status_bayar === 'Lunas' ? 'green' : 'red', fontWeight: 'bold' }}>{t.status_bayar}</span><br/>
                    <small style={{ color: 'blue', fontWeight: 'bold' }}>{t.status_cucian}</small>
                  </td>
                  <td style={{ padding: '10px', display: 'flex', gap: '5px' }}>
                    <button onClick={() => handleEdit(t)} style={{ padding: '5px 10px', backgroundColor: '#ecc94b', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>Edit</button>
                    <button onClick={() => handleDelete(t.id_transaksi)} style={{ padding: '5px 10px', backgroundColor: '#e53e3e', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>Hapus</button>
                    <button onClick={() => handleCetak(t)} style={{ padding: '5px 10px', backgroundColor: '#48bb78', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}>Cetak</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL INPUT / EDIT */}
      {showModal && (
        <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '400px', color: '#2d3748' }}>
            <h3 style={{ marginTop: 0 }}>{isEdit ? 'Ubah Transaksi' : 'Input Transaksi Baru'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" name="nama_pelanggan" placeholder="Nama Pelanggan" value={formData.nama_pelanggan} onChange={handleInputChange} required style={inputStyle} />
              <input type="text" name="no_hp" placeholder="Nomor HP" value={formData.no_hp} onChange={handleInputChange} required style={inputStyle} />
              
              <select name="layanan" value={formData.layanan} onChange={handleInputChange} required style={inputStyle}>
                <option value="">-- Pilih Layanan --</option>
                {listLayanan.map(l => <option key={l.nama} value={l.nama}>{l.nama} (Rp {l.harga}/kg)</option>)}
              </select>
              
              <input type="number" name="berat" placeholder="Berat (Kg)" value={formData.berat} onChange={handleInputChange} required style={inputStyle} />
              
              <div style={{ padding: '10px', backgroundColor: '#edf2f7', fontWeight: 'bold', textAlign: 'center', color: '#2b6cb0' }}>
                Total Harga: Rp {Number(formData.total_harga || 0).toLocaleString('id-ID')}
              </div>

              {isEdit && (
                <select name="status_cucian" value={formData.status_cucian} onChange={handleInputChange} style={inputStyle}>
                  <option value="Antri">Menunggu (Antri)</option>
                  <option value="Dicuci">Sedang Dicuci</option>
                  <option value="Setrika">Sedang Disetrika</option>
                  <option value="Selesai">Cucian Selesai</option>
                </select>
              )}

              <select name="status_bayar" value={formData.status_bayar} onChange={handleInputChange} style={inputStyle}>
                <option value="Belum Lunas">Belum Lunas</option>
                <option value="Lunas">Lunas (Bayar Sekarang)</option>
              </select>

              {formData.status_bayar === 'Lunas' && (
                  <select name="metode_pembayaran" value={formData.metode_pembayaran} onChange={handleInputChange} required style={inputStyle}>
                    <option value="">-- Pilih Pembayaran --</option>
                    <option value="CASH">Tunai (Cash)</option>
                    <option value="QRIS">QRIS / E-Wallet</option>
                    <option value="TRANSFER">Transfer Bank</option>
                  </select>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Simpan</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', backgroundColor: 'gray', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CETAK STRUK */}
      {invoiceData && (
        <div id="print-area" style={{ padding: '20px', width: '300px', border: '1px solid black', fontFamily: 'monospace', color: '#000', backgroundColor: '#fff' }}>
          <h2 style={{ textAlign: 'center', margin: 0 }}>LAUNDRY ADMIN</h2>
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

const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '14px', width: '100%', boxSizing: 'border-box' };