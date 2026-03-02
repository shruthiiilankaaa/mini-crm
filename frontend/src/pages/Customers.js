import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

const emptyForm = { name: '', email: '', phone: '', company: '' };

const Navbar = ({ user, logout }) => (
  <nav style={{background:'#fffdf7', borderBottom:'1px solid #e8e0d0'}} className="px-8 py-4 flex justify-between items-center sticky top-0 z-10">
    <div className="flex items-center gap-8">
      <div className="flex items-center gap-2">
        <span style={{fontSize:20}}>🏢</span>
        <span style={{fontWeight:800, color:'#1a4a3a', fontSize:18}}>MiniCRM</span>
      </div>
      <div className="flex gap-6">
        <Link to="/dashboard" style={{color:'#7a7060', fontSize:14, fontWeight:500}} className="hover:text-gray-900 transition">Dashboard</Link>
        <Link to="/customers" style={{color:'#1a4a3a', fontWeight:600, fontSize:14, borderBottom:'2px solid #1a4a3a', paddingBottom:2}}>Customers</Link>
      </div>
    </div>
    <div className="flex items-center gap-4">
      <span style={{color:'#7a7060', fontSize:14}}>👋 {user?.name}</span>
      <button onClick={logout} style={{background:'#f5f0e8', color:'#4a4035', border:'1px solid #e0d8c8', borderRadius:8, padding:'6px 16px', fontSize:13, fontWeight:500, cursor:'pointer'}}>
        Sign out
      </button>
    </div>
  </nav>
);

export default function Customers() {
  const { user, logout } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchCustomers(); }, [page, q]);

  const fetchCustomers = async () => {
    try {
      const { data } = await API.get(`/customers?page=${page}&q=${encodeURIComponent(q)}`);
      setCustomers(data.customers || []);
      setPages(data.pages || 1);
    } catch { toast.error('Failed to load customers'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await API.put(`/customers/${editId}`, form);
        toast.success('Customer updated!');
      } else {
        await API.post('/customers', form);
        toast.success('Customer added!');
      }
      setForm(emptyForm); setEditId(null); setShowModal(false);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const handleEdit = (c) => {
    setForm({ name: c.name, email: c.email || '', phone: c.phone || '', company: c.company || '' });
    setEditId(c._id); setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer and all their leads?')) return;
    try {
      await API.delete(`/customers/${id}`);
      toast.success('Deleted!'); fetchCustomers();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div style={{background:'#f5f0e8', minHeight:'100vh'}}>
      <Toaster />
      <Navbar user={user} logout={logout} />

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 style={{fontFamily:'Playfair Display, serif', fontSize:36, fontWeight:800, color:'#1a1a1a'}}>Customers</h1>
            <p style={{color:'#7a7060', fontSize:15, marginTop:4}}>{customers.length} total customers</p>
          </div>
          <button onClick={() => { setForm(emptyForm); setEditId(null); setShowModal(true); }} className="btn-primary">
            + Add Customer
          </button>
        </div>

        {/* Search */}
        <div style={{position:'relative', marginBottom:24}}>
          <span style={{position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:16}}>🔍</span>
          <input
            type="text" placeholder="Search by name or email..."
            style={{background:'#fffdf7', border:'1.5px solid #e0d8c8', borderRadius:10, padding:'12px 16px 12px 42px', width:'100%', fontSize:15, color:'#1a1a1a', outline:'none'}}
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
          />
        </div>

        {/* Table */}
        <div style={{background:'#fffdf7', border:'1px solid #e8e0d0', borderRadius:20, overflow:'hidden'}}>
          {customers.length === 0 ? (
            <div style={{textAlign:'center', padding:'60px 0'}}>
              <p style={{fontSize:40, marginBottom:12}}>📭</p>
              <p style={{color:'#7a7060'}}>No customers yet. Add your first one!</p>
            </div>
          ) : (
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#faf6ee'}}>
                  {['Name', 'Email', 'Phone', 'Company', 'Actions'].map(h => (
                    <th key={h} style={{textAlign:'left', padding:'12px 24px', fontSize:12, fontWeight:600, color:'#7a7060', letterSpacing:'0.08em', textTransform:'uppercase'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr key={c._id} style={{borderTop:'1px solid #f0ebe0', background: i % 2 === 0 ? '#fffdf7' : '#fdf9f2'}}>
                    <td style={{padding:'16px 24px', fontWeight:600, color:'#1a1a1a'}}>{c.name}</td>
                    <td style={{padding:'16px 24px', color:'#7a7060', fontSize:14}}>{c.email || '—'}</td>
                    <td style={{padding:'16px 24px', color:'#7a7060', fontSize:14}}>{c.phone || '—'}</td>
                    <td style={{padding:'16px 24px', color:'#7a7060', fontSize:14}}>{c.company || '—'}</td>
                    <td style={{padding:'16px 24px'}}>
                      <div style={{display:'flex', gap:8}}>
                        <Link to={`/customers/${c._id}`} style={{background:'#f5f0e8', color:'#1a4a3a', border:'1px solid #d8d0c0', borderRadius:7, padding:'5px 12px', fontSize:13, fontWeight:500, textDecoration:'none'}}>View</Link>
                        <button onClick={() => handleEdit(c)} style={{background:'#f5f0e8', color:'#4a4035', border:'1px solid #d8d0c0', borderRadius:7, padding:'5px 12px', fontSize:13, cursor:'pointer'}}>Edit</button>
                        <button onClick={() => handleDelete(c._id)} style={{background:'#fee2e2', color:'#991b1b', border:'1px solid #fecaca', borderRadius:7, padding:'5px 12px', fontSize:13, cursor:'pointer'}}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:16, marginTop:24}}>
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
            style={{background:'#fffdf7', border:'1px solid #e0d8c8', borderRadius:8, padding:'8px 18px', fontSize:14, cursor:'pointer', opacity: page===1 ? 0.4 : 1}}>
            ← Prev
          </button>
          <span style={{color:'#7a7060', fontSize:14}}>Page {page} of {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page===pages}
            style={{background:'#fffdf7', border:'1px solid #e0d8c8', borderRadius:8, padding:'8px 18px', fontSize:14, cursor:'pointer', opacity: page===pages ? 0.4 : 1}}>
            Next →
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:16}}>
          <div style={{background:'#fffdf7', border:'1px solid #e8e0d0', borderRadius:20, padding:36, width:'100%', maxWidth:460, boxShadow:'0 20px 60px rgba(0,0,0,0.15)'}}>
            <h2 style={{fontFamily:'Playfair Display, serif', fontSize:24, fontWeight:700, color:'#1a1a1a', marginBottom:24}}>
              {editId ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:16}}>
              {[
                { label:'Full Name', key:'name', type:'text', placeholder:'Jane Smith' },
                { label:'Email', key:'email', type:'email', placeholder:'jane@company.com' },
                { label:'Phone', key:'phone', type:'text', placeholder:'+1 234 567 8900' },
                { label:'Company', key:'company', type:'text', placeholder:'Acme Corp' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label style={{color:'#4a4035', fontSize:12, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', display:'block', marginBottom:6}}>{label}</label>
                  <input type={type} placeholder={placeholder} className="input-field"
                    value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    required={key === 'name'}
                  />
                </div>
              ))}
              <div style={{display:'flex', gap:12, marginTop:8}}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{flex:1, background:'#f5f0e8', color:'#4a4035', border:'1px solid #e0d8c8', borderRadius:10, padding:'12px', fontSize:15, fontWeight:500, cursor:'pointer'}}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary" style={{flex:1, textAlign:'center'}}>
                  {loading ? 'Saving...' : editId ? 'Update' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}