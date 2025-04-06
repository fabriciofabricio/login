// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import CategorySelection from "./components/Auth/CategorySelection";
import Dashboard from "./components/Dashboard/Dashboard";
import DRE from "./components/DRE/DRE";

// Componente de carregamento melhorado usando Tailwind CSS
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen bg-gray-50">
    <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
    <span className="ml-3 text-gray-600 font-medium">Carregando...</span>
  </div>
);

// Rota protegida que requer autenticação
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans antialiased">
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rota para seleção de categorias */}
          <Route 
            path="/select-categories" 
            element={
              <ProtectedRoute>
                <CategorySelection />
              </ProtectedRoute>
            } 
          />
          
          {/* Rota do Dashboard */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Rota de transações (usando a aba 'transactions' do Dashboard) */}
          <Route 
            path="/transactions" 
            element={
              <ProtectedRoute>
                <Dashboard activeTab="transactions" />
              </ProtectedRoute>
            } 
          />
          
          {/* Rota para o DRE */}
          <Route 
            path="/dre" 
            element={
              <ProtectedRoute>
                <DRE />
              </ProtectedRoute>
            } 
          />
          
          {/* Rota padrão - redireciona para login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;