import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', form);
      login({ ...data.user, token: data.token });
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{background:'#f5f0e8'}} className="min-h-screen flex items-center justify-center p-8">
      <Toaster />
      <div style={{background:'#fffdf7', border:'1px solid #e8e0d0', borderRadius:20, boxShadow:'0 8px 40px rgba(0,0,0,0.08)'}} className="w-full max-w-md p-10">
        <div className="mb-2 flex items-center gap-2">
          <span style={{fontSize:24}}>🏢</span>
          <span style={{fontWeight:700, color:'#1a4a3a', fontSize:18}}>MiniCRM</span>
        </div>
        <h1 style={{fontFamily:'Playfair Display, serif', fontSize:32, fontWeight:800, color:'#1a1a1a'}} className="mt-6 mb-2">
          Create your account
        </h1>
        <p style={{color:'#7a7060', fontSize:15}} className="mb-8">Start managing your customers today</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Alex Johnson' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'you@company.com' },
            { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label style={{color:'#4a4035', fontSize:13, fontWeight:600, letterSpacing:'0.05em'}} className="block mb-2 uppercase">{label}</label>
              <input
                type={type} placeholder={placeholder}
                className="input-field"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required
              />
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Creating account...' : 'Get started →'}
          </button>
        </form>

        <p style={{color:'#7a7060', fontSize:14}} className="mt-8 text-center">
          Already have an account?{' '}
          <Link to="/login" style={{color:'#1a4a3a', fontWeight:600}} className="hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}