import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

const STATUS_STYLES = {
  New: { background:'#dbeafe', color:'#1d4ed8', border:'1px solid #bfdbfe' },
  Contacted: { background:'#fef3c7', color:'#b45309', border:'1px solid #fde68a' },
  Converted: { background:'#d1fae5', color:'#065f46', border:'1px solid #a7f3d0' },
  Lost: { background:'#fee2e2', color:'#991b1b', border:'1px solid #fecaca' },
};

const emptyForm = { title: '', description: '', status: 'New', value: 0, followUpDate: '' };

const Navbar = ({ user, logout }) => (
  <nav style={{background:'#fffdf7', borderBottom:'1px solid #e8e0d0'}} className="px-8 py-4 flex justify-between items-center sticky top-0 z-10">
    <div className="flex items-center gap-8">
      <div className="flex items-center gap-2">
        <span style={{fontSize:20}}>🏢</span>
        <span style={{fontWeight:800, color:'#1a4a3a', fontSize:18}}>MiniCRM</span>
      </div>
      <div className="flex gap-6">
        <Link to="/dashboard" style={{color:'#7a7060', fontSize:14, fontWeight:500, textDecoration:'none'}}>Dashboard</Link>
        <Link to="/customers" style={{color:'#7a7060', fontSize:14, fontWeight:500, textDecoration:'none'}}>Customers</Link>
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

export default function CustomerDetail() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [leads, setLeads] = useState([]);
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchDetail(); }, []);

  const fetchDetail = async () => {
    try {
      const { data } = await API.get(`/customers/${id}`);
      setCustomer(data.customer);
      setLeads(data.leads || []);
      setActivities(data.activities || []);
    } catch { toast.error('Failed to load customer'); }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post(`/customers/${id}/leads`, form);
      setLeads(l => [data, ...l]);
      setForm(emptyForm);
      setShowModal(false);
      toast.success('Lead added!');
      fetchDetail();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to add lead');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (leadId, status) => {
    try {
      const { data } = await API.put(`/customers/${id}/leads/${leadId}`, { status });
      setLeads(l => l.map(x => x._id === leadId ? data : x));
      toast.success('Status updated!');
      fetchDetail();
    } catch { toast.error('Failed to update'); }
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await API.delete(`/customers/${id}/leads/${leadId}`);
      setLeads(l => l.filter(x => x._id !== leadId));
      toast.success('Lead deleted!');
      fetchDetail();
    } catch { toast.error('Failed to delete'); }
  };

  const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
  const convertedCount = leads.filter(l => l.status === 'Converted').length;

  const getActivityIcon = (action) => {
    if (action.includes('created')) return '✨';
    if (action.includes('deleted')) return '🗑️';
    if (action.includes('status')) return '🔄';
    return '✏️';
  };

  const getActivityColor = (action) => {
    if (action.includes('created')) return '#d1fae5';
    if (action.includes('deleted')) return '#fee2e2';
    if (action.includes('status')) return '#dbeafe';
    return '#fef3c7';
  };

  if (!customer) return (
    <div style={{background:'#f5f0e8', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#7a7060'}}>
      Loading customer...
    </div>
  );

  return (
    <div style={{background:'#f5f0e8', minHeight:'100vh'}}>
      <Toaster />
      <Navbar user={user} logout={logout} />

      <div className="max-w-5xl mx-auto px-8 py-10">

        {/* Back link */}
        <Link to="/customers" style={{color:'#1a4a3a', fontSize:14, fontWeight:500, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:4, marginBottom:24}}>
          ← Back to Customers
        </Link>

        {/* Customer Hero Card */}
        <div style={{background:'#1a4a3a', borderRadius:20, padding:'32px 36px', marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16}}>
          <div>
            <div style={{background:'rgba(255,255,255,0.15)', borderRadius:12, width:52, height:52, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, marginBottom:16}}>
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <h1 style={{fontFamily:'Playfair Display, serif', fontSize:32, fontWeight:800, color:'#f5f0e8', marginBottom:8}}>
              {customer.name}
            </h1>
            <div style={{display:'flex', gap:20, flexWrap:'wrap'}}>
              {customer.email && <span style={{color:'#a8c5b8', fontSize:14}}>📧 {customer.email}</span>}
              {customer.phone && <span style={{color:'#a8c5b8', fontSize:14}}>📞 {customer.phone}</span>}
              {customer.company && <span style={{color:'#a8c5b8', fontSize:14}}>🏢 {customer.company}</span>}
            </div>
          </div>
          <div style={{textAlign:'right'}}>
            <p style={{color:'#a8c5b8', fontSize:13, marginBottom:4}}>Pipeline Value</p>
            <p style={{fontFamily:'Playfair Display, serif', fontSize:36, fontWeight:800, color:'#7ecfb3'}}>
              ${totalValue.toLocaleString()}
            </p>
            <p style={{color:'#a8c5b8', fontSize:13, marginTop:4}}>{convertedCount} converted</p>
          </div>
        </div>

        {/* Leads Header */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
          <h2 style={{fontFamily:'Playfair Display, serif', fontSize:24, fontWeight:700, color:'#1a1a1a'}}>
            Leads{' '}
            <span style={{color:'#7a7060', fontFamily:'sans-serif', fontSize:16, fontWeight:400}}>
              ({leads.length})
            </span>
          </h2>
          <button
            onClick={() => setShowModal(true)}
            style={{background:'#1a4a3a', color:'white', fontWeight:600, padding:'10px 22px', borderRadius:10, border:'none', cursor:'pointer', fontSize:14}}
          >
            + Add Lead
          </button>
        </div>

        {/* Leads List */}
        {leads.length === 0 ? (
          <div style={{background:'#fffdf7', border:'1px solid #e8e0d0', borderRadius:20, textAlign:'center', padding:'60px 0'}}>
            <p style={{fontSize:40, marginBottom:12}}>📋</p>
            <p style={{color:'#7a7060'}}>No leads yet. Add the first one!</p>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            {leads.map((lead) => (
              <div key={lead._id} style={{background:'#fffdf7', border:'1px solid #e8e0d0', borderRadius:16, padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12}}>
                <div style={{flex:1}}>
                  <p style={{fontWeight:600, color:'#1a1a1a', fontSize:16}}>{lead.title}</p>
                  {lead.description && (
                    <p style={{color:'#7a7060', fontSize:14, marginTop:4}}>{lead.description}</p>
                  )}
                  <p style={{color:'#1a4a3a', fontWeight:600, fontSize:15, marginTop:6}}>
                    ${(lead.value || 0).toLocaleString()}
                  </p>
                  {lead.followUpDate && (
                    <p style={{color:'#b45309', fontSize:12, marginTop:4}}>
                      ⏰ Follow-up: {new Date(lead.followUpDate).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                    </p>
                  )}
                </div>
                <div style={{display:'flex', alignItems:'center', gap:12, flexWrap:'wrap'}}>
                  <span style={{...STATUS_STYLES[lead.status], borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:600}}>
                    {lead.status}
                  </span>
                  <select
                    value={lead.status}
                    onChange={(e) => handleUpdateStatus(lead._id, e.target.value)}
                    style={{background:'#f5f0e8', border:'1px solid #e0d8c8', borderRadius:8, padding:'6px 10px', fontSize:13, color:'#4a4035', cursor:'pointer', outline:'none'}}
                  >
                    {['New', 'Contacted', 'Converted', 'Lost'].map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDeleteLead(lead._id)}
                    style={{background:'#fee2e2', color:'#991b1b', border:'1px solid #fecaca', borderRadius:8, padding:'6px 14px', fontSize:13, cursor:'pointer'}}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Activity Log */}
        <div style={{marginTop:40}}>
          <h2 style={{fontFamily:'Playfair Display, serif', fontSize:24, fontWeight:700, color:'#1a1a1a', marginBottom:20}}>
            Activity Log
          </h2>
          {activities.length === 0 ? (
            <div style={{background:'#fffdf7', border:'1px solid #e8e0d0', borderRadius:16, textAlign:'center', padding:'32px 0'}}>
              <p style={{color:'#7a7060', fontSize:14}}>No activity yet.</p>
            </div>
          ) : (
            <div style={{position:'relative'}}>
              <div style={{position:'absolute', left:19, top:0, bottom:0, width:2, background:'#e8e0d0'}} />
              <div style={{display:'flex', flexDirection:'column', gap:0}}>
                {activities.map((a) => (
                  <div key={a._id} style={{display:'flex', gap:16, alignItems:'flex-start', paddingBottom:20, position:'relative'}}>
                    <div style={{
                      width:40, height:40, borderRadius:'50%',
                      background: getActivityColor(a.action),
                      border:'2px solid #f5f0e8',
                      flexShrink:0,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:16, zIndex:1
                    }}>
                      {getActivityIcon(a.action)}
                    </div>
                    <div style={{background:'#fffdf7', border:'1px solid #e8e0d0', borderRadius:12, padding:'12px 16px', flex:1}}>
                      <p style={{fontWeight:600, color:'#1a1a1a', fontSize:14}}>{a.action}</p>
                      <p style={{color:'#7a7060', fontSize:13, marginTop:2}}>{a.detail}</p>
                      <p style={{color:'#b0a898', fontSize:12, marginTop:6}}>
                        {new Date(a.createdAt).toLocaleDateString('en-US', {
                          month:'short', day:'numeric',
                          hour:'2-digit', minute:'2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Add Lead Modal */}
      {showModal && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:16}}>
          <div style={{background:'#fffdf7', border:'1px solid #e8e0d0', borderRadius:20, padding:36, width:'100%', maxWidth:460, boxShadow:'0 20px 60px rgba(0,0,0,0.15)', maxHeight:'90vh', overflowY:'auto'}}>
            <h2 style={{fontFamily:'Playfair Display, serif', fontSize:24, fontWeight:700, color:'#1a1a1a', marginBottom:24}}>
              Add New Lead
            </h2>
            <form onSubmit={handleAddLead} style={{display:'flex', flexDirection:'column', gap:16}}>

              <div>
                <label style={{color:'#4a4035', fontSize:12, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', display:'block', marginBottom:6}}>
                  Lead Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise Deal Q1"
                  className="input-field"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{color:'#4a4035', fontSize:12, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', display:'block', marginBottom:6}}>
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Optional details..."
                  className="input-field"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label style={{color:'#4a4035', fontSize:12, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', display:'block', marginBottom:6}}>
                  Status
                </label>
                <select
                  className="input-field"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {['New', 'Contacted', 'Converted', 'Lost'].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{color:'#4a4035', fontSize:12, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', display:'block', marginBottom:6}}>
                  Value ($)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="input-field"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                />
              </div>

              <div>
                <label style={{color:'#4a4035', fontSize:12, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', display:'block', marginBottom:6}}>
                  ⏰ Follow-up Date (optional)
                </label>
                <input
                  type="date"
                  className="input-field"
                  value={form.followUpDate}
                  onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
                />
                <p style={{color:'#b0a898', fontSize:12, marginTop:4}}>
                  You'll receive an email reminder on this date
                </p>
              </div>

              <div style={{display:'flex', gap:12, marginTop:8}}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{flex:1, background:'#f5f0e8', color:'#4a4035', border:'1px solid #e0d8c8', borderRadius:10, padding:12, fontSize:15, fontWeight:500, cursor:'pointer'}}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{flex:1, background:'#1a4a3a', color:'white', border:'none', borderRadius:10, padding:12, fontSize:15, fontWeight:600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1}}
                >
                  {loading ? 'Adding...' : 'Add Lead'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}