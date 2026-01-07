import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SellerForm from './components/SellerForm';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import PrintView from './components/PrintView';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SellerForm />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/panel" 
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } 
        />
        <Route path="/print/:id" element={<PrintView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
