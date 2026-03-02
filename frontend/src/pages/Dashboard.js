import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

const Navbar = ({ user, logout }) => (
  <nav style={{background:'#fffdf7', borderBottom:'1px solid #e8e0d0'}} className="px-8 py-4 flex justify-between items-center sticky top-0 z-10">
    <div className="flex items-center gap-8">
      <div className="flex items-center gap-2">
        <span style={{fontSize:20}}>🏢</span>
        <span style={{fontWeight:800, color:'#1a4a3a', fontSize:18}}>MiniCRM</span>
      </div>
      <div className="flex gap-6">
        <Link to="/dashboard" style={{color:'#1a4a3a', fontWeight:600, fontSize:14, borderBottom:'2px solid #1a4a3a', paddingBottom:2}}>Dashboard</Link>
        <Link to="/customers" style={{color:'#7a7060', fontSize:14, fontWeight:500}} className="hover:text-gray-900 transition">Customers</Link>
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

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ customers: 0, New: 0, Contacted: 0, Converted: 0, Lost: 0 });
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await API.get('/customers?limit=50');
      const customers = data.customers || [];
      setRecentCustomers(customers.slice(0, 5));
      try {
        const statsRes = await API.get('/customers/stats');
        setStats({ customers: customers.length, ...statsRes.data });
      } catch {
        setStats({ customers: customers.length, New: 0, Contacted: 0, Converted: 0, Lost: 0 });
      }
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  const statCards = [
    { label: 'Total Customers', value: stats.customers, icon: '👥', color: '#1a4a3a', bg: '#e8f5f0' },
    { label: 'New Leads', value: stats.New || 0, icon: '🌱', color: '#1d4ed8', bg: '#dbeafe' },
    { label: 'Contacted', value: stats.Contacted || 0, icon: '📞', color: '#b45309', bg: '#fef3c7' },
    { label: 'Converted', value: stats.Converted || 0, icon: '🏆', color: '#065f46', bg: '#d1fae5' },
    { label: 'Lost', value: stats.Lost || 0, icon: '📉', color: '#991b1b', bg: '#fee2e2' },
  ];

  return (
    <div style={{background:'#f5f0e8', minHeight:'100vh'}}>
      <Toaster />
      <Navbar user={user} logout={logout} />

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 style={{fontFamily:'Playfair Display, serif', fontSize:36, fontWeight:800, color:'#1a1a1a'}}>
            Good morning, {user?.name?.split(' ')[0]} ☀️
          </h1>
          <p style={{color:'#7a7060', fontSize:16, marginTop:6}}>Here's what's happening with your pipeline today.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {statCards.map((s) => (
            <div key={s.label} style={{background:'#fffdf7', border:'1px solid #e8e0d0', borderRadius:16, padding:'20px 16px'}}>
              <div style={{background:s.bg, width:40, height:40, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, marginBottom:12}}>
                {s.icon}
              </div>
              <p style={{fontSize:28, fontWeight:800, color:s.color}}>{s.value}</p>
              <p style={{fontSize:13, color:'#7a7060', marginTop:2}}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Customers Table */}
        <div style={{background:'#fffdf7', border:'1px solid #e8e0d0', borderRadius:20, overflow:'hidden'}}>
          <div style={{padding:'20px 28px', borderBottom:'1px solid #e8e0d0', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h2 style={{fontFamily:'Playfair Display, serif', fontSize:20, fontWeight:700, color:'#1a1a1a'}}>Recent Customers</h2>
            <Link to="/customers" style={{color:'#1a4a3a', fontSize:13, fontWeight:600, textDecoration:'none'}}>
              View all customers →
            </Link>
          </div>

          {loading ? (
            <div style={{textAlign:'center', padding:'60px 0', color:'#7a7060'}}>Loading...</div>
          ) : recentCustomers.length === 0 ? (
            <div style={{textAlign:'center', padding:'60px 0'}}>
              <p style={{fontSize:40, marginBottom:12}}>📭</p>
              <p style={{color:'#7a7060', marginBottom:8}}>No customers yet</p>
              <Link to="/customers" style={{color:'#1a4a3a', fontWeight:600, fontSize:14}}>Add your first customer →</Link>
            </div>
          ) : (
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#faf6ee'}}>
                  {['Name', 'Email', 'Company', 'Actions'].map(h => (
                    <th key={h} style={{textAlign:'left', padding:'12px 28px', fontSize:12, fontWeight:600, color:'#7a7060', letterSpacing:'0.08em', textTransform:'uppercase'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentCustomers.map((c, i) => (
                  <tr key={c._id} style={{borderTop:'1px solid #f0ebe0', background: i % 2 === 0 ? '#fffdf7' : '#fdf9f2'}}>
                    <td style={{padding:'16px 28px', fontWeight:600, color:'#1a1a1a', fontSize:15}}>{c.name}</td>
                    <td style={{padding:'16px 28px', color:'#7a7060', fontSize:14}}>{c.email || '—'}</td>
                    <td style={{padding:'16px 28px', color:'#7a7060', fontSize:14}}>{c.company || '—'}</td>
                    <td style={{padding:'16px 28px'}}>
                      <Link to={`/customers/${c._id}`} style={{background:'#f5f0e8', color:'#1a4a3a', border:'1px solid #d8d0c0', borderRadius:7, padding:'5px 14px', fontSize:13, fontWeight:500, textDecoration:'none'}}>
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}