import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function KaryawanPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nama: '', email: '', nip: '', jabatan: '', departemen: '', role: 'karyawan', password: '' });

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await supabase.from('employees').select('*').order('nama');
      setEmployees(data || []);
    } catch (err) {
      console.warn('Supabase not configured');
    }
    setLoading(false);
  };

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);

    try {
      // Buat user auth via signUp — trigger handle_new_user() akan buat employees
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password || 'Welcome123!',
        options: {
          data: {
            nama: form.nama,
            nip: form.nip,
            jabatan: form.jabatan,
            departemen: form.departemen,
          },
        },
      });

      if (authError) {
        setFormError(authError.message);
        return;
      }

      if (!authData.user) {
        setFormError('Gagal membuat akun. Coba lagi.');
        return;
      }

      // Jika role = admin, update setelah employee terbuat
      if (form.role === 'admin') {
        await supabase.from('employees').update({ role: 'admin' }).eq('id', authData.user.id);
      }

      setFormSuccess(`Akun berhasil dibuat untuk ${form.email}.`);
      setForm({ nama: '', email: '', nip: '', jabatan: '', departemen: '', role: 'karyawan', password: '' });
      fetchEmployees();

      setTimeout(() => {
        setShowForm(false);
        setFormSuccess('');
      }, 5000);
    } catch (err: any) {
      setFormError(err.message || 'Gagal terhubung ke server.');
    }
    setFormLoading(false);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Karyawan</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {employees.length} karyawan terdaftar
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="toggle-view">
            <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>📇 Grid</button>
            <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>📋 List</button>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            + Tambah Karyawan
          </button>
        </div>
      </div>

      {/* Add Employee Form */}
      {showForm && (
        <div className="chart-container animate-fadeIn" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Tambah Karyawan Baru</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {formError && (
              <div style={{ gridColumn: '1 / -1', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', color: '#ef4444', fontSize: '0.85rem', fontWeight: 500 }}>
                {formError}
              </div>
            )}
            {formSuccess && (
              <div style={{ gridColumn: '1 / -1', padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '0.75rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ✅ {formSuccess}
              </div>
            )}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.25rem', display: 'block' }}>Nama Lengkap</label>
              <input className="input-field" placeholder="Nama" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.25rem', display: 'block' }}>Email</label>
              <input className="input-field" type="email" placeholder="email@company.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.25rem', display: 'block' }}>NIP</label>
              <input className="input-field" placeholder="NIP" value={form.nip} onChange={e => setForm({...form, nip: e.target.value})} required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.25rem', display: 'block' }}>Jabatan</label>
              <input className="input-field" placeholder="Jabatan" value={form.jabatan} onChange={e => setForm({...form, jabatan: e.target.value})} required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.25rem', display: 'block' }}>Departemen</label>
              <input className="input-field" placeholder="Departemen" value={form.departemen} onChange={e => setForm({...form, departemen: e.target.value})} required />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.25rem', display: 'block' }}>Role</label>
              <select className="input-field" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="karyawan">Karyawan</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '0.25rem', display: 'block' }}>Password</label>
              <input className="input-field" type="password" placeholder="Kosongkan untuk default" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)} disabled={formLoading}>Batal</button>
              <button type="submit" className="btn-primary" disabled={formLoading}>
                {formLoading ? 'Mengirim undangan...' : 'Simpan & Undang'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {loading ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-text-light)', padding: '2rem' }}>Memuat...</p>
          ) : employees.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--color-text-light)', padding: '2rem' }}>
              Belum ada karyawan. Setelah Supabase terhubung, data akan tampil di sini.
            </p>
          ) : (
            employees.map((emp, i) => (
              <div key={emp.id} className="stat-card animate-fadeIn" style={{ animationDelay: `${i * 0.05}s` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '1.125rem', flexShrink: 0,
                  }}>
                    {emp.avatar_initials || emp.nama?.[0] || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{emp.nama}</p>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{emp.jabatan}</p>
                  </div>
                  <span style={{
                    fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontWeight: 600,
                    background: emp.role === 'admin' ? '#d1fae5' : '#f1f5f9',
                    color: emp.role === 'admin' ? '#065f46' : '#64748b',
                  }}>
                    {emp.role === 'admin' ? 'Admin' : 'Karyawan'}
                  </span>
                </div>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>NIP</span>
                    <span style={{ fontWeight: 500 }}>{emp.nip}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Departemen</span>
                    <span style={{ fontWeight: 500 }}>{emp.departemen}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Bergabung</span>
                    <span style={{ fontWeight: 500 }}>{emp.tanggal_bergabung || '-'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* List View */
        <div className="chart-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Karyawan</th>
                <th>NIP</th>
                <th>Jabatan</th>
                <th>Departemen</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>Memuat...</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>Belum ada data</td></tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>
                          {emp.avatar_initials || emp.nama?.[0]}
                        </div>
                        <span style={{ fontWeight: 500 }}>{emp.nama}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{emp.nip}</td>
                    <td>{emp.jabatan}</td>
                    <td>{emp.departemen}</td>
                    <td>
                      <span style={{
                        padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600,
                        background: emp.role === 'admin' ? '#d1fae5' : '#f1f5f9',
                        color: emp.role === 'admin' ? '#065f46' : '#64748b',
                      }}>
                        {emp.role}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
