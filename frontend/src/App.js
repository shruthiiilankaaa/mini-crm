
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
export default function App(){
  return (
    <div style={{padding:20,fontFamily:'Arial, sans-serif'}}>
      <nav style={{marginBottom:20}}>
        <Link to="/dashboard">Dashboard</Link> | <Link to="/customers">Customers</Link> | <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
      </nav>
      <Outlet/>
    </div>
  );
}
