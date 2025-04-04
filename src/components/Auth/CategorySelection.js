// src/components/Auth/CategorySelection.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./CategorySelection.css";

const CategorySelection = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState({});

  // Estrutura de categorias financeiras
  const financialCategories = {
    "1. RECEITA BRUTA": [
      "Dinheiro",
      "Cheque",
      "Boleto",
      "Transferência",
      "Cartão / Pix / TED",
      "Ifood",
      "Outras Entradas"
    ],
    "2. (-) DEDUÇÕES DA RECEITA": [
      "ISS",
      "ICMS",
      "PIS/COFINS"
    ],
    "4. (+) OUTRAS RECEITAS OPERACIONAIS E NÃO OPERACIONAIS": [
      "Resgate de Aplicação",
      "Empréstimo",
      "Aporte de Sócio"
    ],
    "5. (-) CUSTOS DAS MERCADORIAS VENDIDAS (CMV)": [
      "Insumos e ingredientes",
      "Doces",
      "Carnes",
      "Bebidas",
      "Vinho",
      "Chopp",
      "Hortifrúti",
      "Café"
    ],
    "7. (-) DESPESAS OPERACIONAIS": [
        "DAS",
        "Contabilidade",
        "Consultoria / Assessoria",
        "Advogado",
        "Segurança",
        "Sistema",
        "Despesa Bancária",
        "Despesa Financeira",
        "Correio / Cartório",
        "Outras Despesas ADM",
        "Aluguel",
        "Condomínio",
        "Energia Elétrica",
        "Gás",
        "Água / Esgoto (Sanepar)",
        "Internet",
        "Telefone e TV a Cabo",
        "Estacionamento",
        "Equipamentos",
        "Informática",
        "Predial",
        "Móveis e Utensílios",
        "Dedetização",
        "Propaganda e Publicidade",
        "Serviços Gráficos",
        "Material de Escritório",
        "Embalagem / Descartáveis",
        "Limpeza / Higiene",
        "Materiais de Reposição",
        "Salário",
        "Adiantamento",
        "Free-lance / Taxa",
        "13º Salário",
        "Férias + Abono",
        "Rescisão Contratual",
        "Vale Transporte",
        "Exame Médico",
        "FGTS",
        "Contribuição Sindical",
        "Refeição Funcionário",
        "INSS",
        "Treinamento",
        "Uniforme",
        "Farmácia",
        "Artístico",
        "Outras Despesas RH",
        "Locação de Equipamentos",
        "Aquisição de Equipamentos"
    ],
    "8. (-) DESPESAS COM SÓCIOS": [
      "Despesas de Sócios",
      "Pró-labore",
      "Imposto de Renda Pessoa Física"
    ],
    "9. (-) INVESTIMENTOS": [
      "Obras e Instalações",
      "Informática",
      "Equipamentos / Aplicações em Fundos"
    ]
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleCategoryToggle = (group, category, subGroup = null) => {
    console.log(`Toggling: group=${group}, category=${category}, subGroup=${subGroup}`);
    
    setSelectedCategories(prev => {
      const path = subGroup 
        ? `${group}.${subGroup}.${category}`
        : `${group}.${category}`;
      
      console.log("Path:", path);
      
      return {
        ...prev,
        [path]: !prev[path]
      };
    });
  };

  const saveCategories = async () => {
    if (!user) {
      console.error("Usuário não autenticado");
      alert("Você precisa estar logado para salvar categorias.");
      navigate("/login");
      return;
    }
    
    try {
      setSaving(true);
      
      // Verificar autenticação atual
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }
      
      // Preparar os dados para salvar
      const categoriesToSave = {};
      
      // Processar categorias selecionadas
      Object.keys(selectedCategories).forEach(path => {
        if (selectedCategories[path]) {
          categoriesToSave[path] = true;
        }
      });

      console.log("Salvando categorias para o usuário:", currentUser.uid);
      
      // Salvar no Firestore
      await setDoc(doc(db, "userCategories", currentUser.uid), {
        categories: categoriesToSave,
        createdAt: new Date()
      });

      console.log("Categorias salvas com sucesso!");
      
      // Navegar para o dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao salvar categorias:", error);
      
      let errorMessage = "Erro ao salvar suas categorias. Tente novamente.";
      
      if (error.code === "permission-denied") {
        errorMessage = "Permissão negada. Verifique as regras do Firestore.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const renderCategories = (categories, group, subGroup = null) => {
    console.log(`Renderizando: group=${group}, subGroup=${subGroup}, isArray=${Array.isArray(categories)}`);
    
    if (Array.isArray(categories)) {
      return (
        <div className="category-list">
          {categories.map((category, index) => (
            <div key={index} className="category-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={subGroup 
                    ? !!selectedCategories[`${group}.${subGroup}.${category}`]
                    : !!selectedCategories[`${group}.${category}`]
                  }
                  onChange={() => handleCategoryToggle(group, category, subGroup)}
                />
                {category}
              </label>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="category-group">
          {Object.keys(categories).map((subGroupName, index) => (
            <div key={index} className="category-subgroup">
              <h4>{subGroupName}</h4>
              {renderCategories(categories[subGroupName], group, subGroupName)}
            </div>
          ))}
        </div>
      );
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="category-selection-container">
      <div className="category-selection-card">
        <h2>Selecione suas Categorias Financeiras</h2>
        <p className="instruction">Marque as categorias que você deseja utilizar em sua conta.</p>
        
        <div className="categories-container">
          {Object.keys(financialCategories).map((group, index) => (
            <div key={index} className="category-group">
              <h3>{group}</h3>
              {renderCategories(financialCategories[group], group)}
            </div>
          ))}
        </div>

        <div className="button-container">
          <button 
            className="save-button" 
            onClick={saveCategories} 
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar e Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategorySelection;