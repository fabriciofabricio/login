// src/components/Auth/CategorySelection.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./CategorySelection.css";

const CategorySelection = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState({});
  const [currentStep, setCurrentStep] = useState(0);

  // Estrutura de categorias financeiras
  const financialCategories = {
    "RECEITA BRUTA": [
      "Dinheiro",
      "Cheque",
      "Boleto",
      "Transferência",
      "Cartão / Pix / TED",
      "Ifood",
      "Outras Entradas"
    ],
    "(-) DEDUÇÕES DA RECEITA": [
      "ISS",
      "ICMS",
      "PIS/COFINS"
    ],
    "(+) OUTRAS RECEITAS OPERACIONAIS E NÃO OPERACIONAIS": [
      "Resgate de Aplicação",
      "Empréstimo",
      "Aporte de Sócio"
    ],
    "(-) CUSTOS DAS MERCADORIAS VENDIDAS (CMV)": [
      "Insumos e ingredientes",
      "Doces",
      "Carnes",
      "Bebidas",
      "Vinho",
      "Chopp",
      "Hortifrúti",
      "Café"
    ],
    "(-) DESPESAS OPERACIONAIS": [
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
    "(-) DESPESAS COM SÓCIOS": [
      "Despesas de Sócios",
      "Pró-labore",
      "Imposto de Renda Pessoa Física"
    ],
    "(-) INVESTIMENTOS": [
      "Obras e Instalações",
      "Informática",
      "Equipamentos / Aplicações em Fundos"
    ]
  };

  // Converter o objeto de categorias em um array para facilitar a navegação
  const categoryGroups = Object.keys(financialCategories);
  const totalSteps = categoryGroups.length;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Carregar categorias previamente selecionadas pelo usuário
        loadUserCategories(currentUser.uid);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);
  
  // Função para carregar as categorias do usuário do Firestore
  const loadUserCategories = async (userId) => {
    try {
      const userCategoriesDoc = await getDoc(doc(db, "userCategories", userId));
      
      if (userCategoriesDoc.exists()) {
        const data = userCategoriesDoc.data();
        
        if (data.categories) {
          console.log("Categorias carregadas:", data.categories);
          setSelectedCategories(data.categories);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar categorias do usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (category) => {
    const currentGroup = categoryGroups[currentStep];
    
    setSelectedCategories(prev => {
      const path = `${currentGroup}.${category}`;
      
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

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prevStep => prevStep + 1);
    } else {
      saveCategories();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prevStep => prevStep - 1);
    }
  };

  if (loading) {
    return (
      <div className="category-selection-container">
        <div className="category-selection-card loading-card">
          <div className="loading-spinner"></div>
          <p>Carregando suas categorias...</p>
        </div>
      </div>
    );
  }

  // Obter o grupo e categorias atuais
  const currentGroup = categoryGroups[currentStep];
  const currentCategories = financialCategories[currentGroup];

  return (
    <div className="category-selection-container">
      <div className="category-selection-card">
        <div className="progress-bar-container">
          <div className="progress-text">
            Etapa {currentStep + 1} de {totalSteps}
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="step-heading">
          <span className="step-number">Etapa {currentStep + 1}</span>
          <h2 className="category-group-title">{currentGroup}</h2>
        </div>
        
        <p className="instruction">Selecione as opções que você deseja utilizar:</p>
        
        <div className="categories-container">
          <div className="category-list single-page">
            {currentCategories.map((category, index) => (
              <div key={index} className="category-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={!!selectedCategories[`${currentGroup}.${category}`]}
                    onChange={() => handleCategoryToggle(category)}
                  />
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="navigation-buttons">
          <button 
            className="previous-button" 
            onClick={handlePrevious} 
            disabled={currentStep === 0}
          >
            Anterior
          </button>
          
          <button 
            className="next-button" 
            onClick={handleNext}
            disabled={saving}
          >
            {currentStep === totalSteps - 1 
              ? (saving ? "Salvando..." : "Finalizar") 
              : "Próximo"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategorySelection;