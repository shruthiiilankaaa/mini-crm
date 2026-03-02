import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login({ ...data.user, token: data.token });
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{background:'#f5f0e8'}} className="min-h-screen flex">
      <Toaster />

      {/* Left Panel */}
      <div style={{background:'#1a4a3a'}} className="hidden lg:flex flex-col justify-between w-2/5 p-12">
        <div>
          <div className="flex items-center gap-3">
            <div style={{background:'#f5f0e8', borderRadius:10}} className="w-9 h-9 flex items-center justify-center">
              <span style={{fontSize:18}}>🏢</span>
            </div>
            <span style={{color:'#f5f0e8', fontWeight:700, fontSize:20}}>MiniCRM</span>
          </div>
        </div>
        <div>
          <p style={{fontFamily:'Playfair Display, serif', color:'#f5f0e8', fontSize:42, fontWeight:800, lineHeight:1.2}} className="mb-6">
            Build better customer relationships.
          </p>
          <p style={{color:'#a8c5b8', fontSize:16, lineHeight:1.7}}>
            Track leads, manage customers, and close more deals — all in one place.
          </p>
          <div className="mt-10 space-y-4">
            {['Customer management', 'Lead tracking & pipeline', 'Real-time analytics'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div style={{background:'#2d6b57', borderRadius:6}} className="w-6 h-6 flex items-center justify-center">
                  <span style={{color:'#7ecfb3', fontSize:12}}>✓</span>
                </div>
                <span style={{color:'#c8ddd7', fontSize:15}}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p style={{color:'#5a8f7e', fontSize:13}}>© 2024 MiniCRM. Built for modern teams.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div style={{background:'#fffdf7', border:'1px solid #e8e0d0', borderRadius:20, boxShadow:'0 8px 40px rgba(0,0,0,0.08)'}} className="w-full max-w-md p-10">
          <div className="mb-8">
            <h1 style={{fontFamily:'Playfair Display, serif', fontSize:32, fontWeight:800, color:'#1a1a1a'}} className="mb-2">
              Sign in
            </h1>
            <p style={{color:'#7a7060', fontSize:15}}>Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label style={{color:'#4a4035', fontSize:13, fontWeight:600, letterSpacing:'0.05em'}} className="block mb-2 uppercase">Email</label>
              <input
                type="email" placeholder="you@company.com"
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={{color:'#4a4035', fontSize:13, fontWeight:600, letterSpacing:'0.05em'}} className="block mb-2 uppercase">Password</label>
              <input
                type="password" placeholder="••••••••"
                className="input-field"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <p style={{color:'#7a7060', fontSize:14}} className="mt-8 text-center">
            No account?{' '}
            <Link to="/register" style={{color:'#1a4a3a', fontWeight:600}} className="hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}