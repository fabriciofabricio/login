// src/components/Dashboard/Dashboard.js
import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase/config";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

// Componente principal do Dashboard
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoriesData, setCategoriesData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        setUser(auth.currentUser);
        
        try {
          // Buscar categorias do usuário
          const userCategoriesDoc = await getDoc(doc(db, "userCategories", auth.currentUser.uid));
          
          if (userCategoriesDoc.exists()) {
            const data = userCategoriesDoc.data();
            setCategoriesData(data);
          }
        } catch (error) {
          console.error("Erro ao buscar categorias:", error);
        }
      }
      
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Função para organizar as categorias em grupos e subgrupos
  const organizeCategories = () => {
    if (!categoriesData || !categoriesData.categories) {
      return {
        groupedCategories: {},
        totalCategories: 0
      };
    }

    const categories = categoriesData.categories;
    const categoryOrder = categoriesData.categoryOrder || {};
    
    const selectedKeys = Object.keys(categories).filter(key => categories[key] === true);
    const groupedCategories = {};

    // Processar cada chave
    selectedKeys.forEach(key => {
      const parts = key.split('.');
      
      // Obter o grupo (primeira parte)
      const groupName = parts[0];
      
      // Inicializar o grupo se não existir
      if (!groupedCategories[groupName]) {
        // Usar a ordem se disponível, ou um número alto para categorias sem ordem
        const order = categoryOrder[groupName] || 999;
        groupedCategories[groupName] = {
          normalCategories: [],
          subGroups: {},
          order: order
        };
      }
      
      // Verificar se tem 2 ou 3 partes (com ou sem subgrupo)
      if (parts.length === 2) {
        // Sem subgrupo: grupo.categoria
        groupedCategories[groupName].normalCategories.push(parts[1]);
      } else if (parts.length === 3) {
        // Com subgrupo: grupo.subgrupo.categoria
        const subGroupName = parts[1];
        const categoryName = parts[2];
        
        if (!groupedCategories[groupName].subGroups[subGroupName]) {
          groupedCategories[groupName].subGroups[subGroupName] = [];
        }
        
        groupedCategories[groupName].subGroups[subGroupName].push(categoryName);
      }
    });

    return {
      groupedCategories,
      totalCategories: selectedKeys.length
    };
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  const { groupedCategories, totalCategories } = organizeCategories();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="user-info">
          <span>Olá, {user?.displayName || "Usuário"}</span>
          <button className="logout-button" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2>Suas Categorias Financeiras</h2>
          
          {totalCategories === 0 ? (
            <div className="no-categories">
              <p>Você ainda não selecionou nenhuma categoria.</p>
              <button 
                className="select-categories-button"
                onClick={() => navigate("/select-categories")}
              >
                Selecionar Categorias
              </button>
            </div>
          ) : (
            <>
              <p className="categories-count">
                Você selecionou {totalCategories} categorias.
              </p>
              
              <div className="categories-container">
                {Object.entries(groupedCategories)
                  .sort(([, dataA], [, dataB]) => {
                    // Ordenar pelo campo order que adicionamos
                    return dataA.order - dataB.order;
                  })
                  .map(([groupName, groupData], index) => (
                    <div key={index} className="category-group">
                      <h3>{groupName}</h3>
                      
                      {/* Categorias normais (sem subgrupo) */}
                      {groupData.normalCategories.length > 0 && (
                        <ul className="category-list">
                          {groupData.normalCategories.map((category, catIndex) => (
                            <li key={catIndex} className="category-item">{category}</li>
                          ))}
                        </ul>
                      )}
                      
                      {/* Categorias com subgrupos */}
                      {Object.entries(groupData.subGroups).map(([subGroupName, categories], subIndex) => (
                        <div key={subIndex} className="category-subgroup-section">
                          <h4>{subGroupName}</h4>
                          <ul className="category-list">
                            {categories.map((category, catIndex) => (
                              <li key={catIndex} className="category-item">{category}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
              
              <div className="edit-categories">
                <button 
                  className="edit-categories-button"
                  onClick={() => navigate("/select-categories")}
                >
                  Editar Categorias
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;