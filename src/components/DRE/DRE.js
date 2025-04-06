// src/components/DRE/DRE.js (com aba de categorização adicionada)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/config";
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import DreCategorizationTab from "./DreCategorizationTab";
import "./DRE.css";

// Estilos inline para garantir alta especificidade
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    paddingBottom: '20px',
    borderBottom: '1px solid #e0e0e0',
    flexWrap: 'wrap'
  },
  heading: {
    color: '#333333',
    margin: '0',
    fontSize: '24px',
    fontWeight: '600'
  },
  periodSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  label: {
    fontWeight: '500',
    color: '#666666',
    fontSize: '15px'
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '15px',
    backgroundColor: 'white',
    minWidth: '200px',
    color: '#333333'
  },
  tabContainer: {
    display: 'flex',
    marginBottom: '25px',
    borderBottom: '1px solid #e0e0e0',
    overflowX: 'auto'
  },
  tab: {
    padding: '14px 25px',
    background: '#4285f4',
    border: 'none',
    fontSize: '16px',
    fontWeight: '500',
    color: 'white',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexGrow: 1,
    textAlign: 'center',
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
    marginRight: '4px'
  },
  tabActive: {
    background: '#3367d6',
    borderBottom: '3px solid white',
    fontWeight: '700'
  },
  alert: {
    borderLeft: '4px solid #f59e0b',
    backgroundColor: '#fff8e1',
    padding: '16px',
    borderRadius: '4px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'flex-start'
  },
  alertIcon: {
    color: '#f59e0b',
    marginRight: '12px',
    fontSize: '20px'
  },
  alertContent: {
    flex: '1'
  },
  alertText: {
    color: '#775200',
    margin: '0 0 8px 0'
  },
  alertActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '12px'
  },
  categorizeButton: {
    padding: '8px 16px',
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  toggleButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#b45309',
    border: '1px solid #f59e0b',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  kpiContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  kpiCard: {
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
  },
  kpiTitle: {
    color: '#666666',
    fontSize: '16px',
    fontWeight: '500',
    marginTop: '0',
    marginBottom: '8px'
  },
  kpiValue: {
    color: '#4285f4',
    fontSize: '24px',
    fontWeight: '600',
    margin: '0'
  },
  detailsContainer: {
    marginBottom: '30px'
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  tableActions: {
    display: 'flex',
    gap: '10px'
  },
  actionButton: {
    padding: '8px 16px',
    backgroundColor: '#4285f4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHead: {
    backgroundColor: '#f5f5f5',
    color: '#333'
  },
  tableHeadCell: {
    padding: '12px 20px',
    textAlign: 'left',
    borderBottom: '2px solid #ddd'
  },
  tableCell: {
    padding: '12px 20px',
    borderBottom: '1px solid #e0e0e0'
  },
  groupRow: {
    backgroundColor: '#f8f9fa'
  },
  totalRow: {
    backgroundColor: '#e3f2fd',
    fontWeight: '600'
  },
  groupName: {
    fontWeight: '600',
    color: '#333'
  },
  categoryName: {
    paddingLeft: '32px',
    color: '#666',
    position: 'relative'
  },
  positiveValue: {
    color: '#4caf50'
  },
  negativeValue: {
    color: '#f44336'
  },
  chartPlaceholder: {
    height: '300px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '30px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px dashed #ddd'
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '3px solid #e0e0e0',
    borderTopColor: '#4285f4',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  }
};

// Componente principal DRE
const DRE = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [dreData, setDreData] = useState({});
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [uncategorizedCount, setUncategorizedCount] = useState(0);
  const [uncategorizedAmount, setUncategorizedAmount] = useState(0);
  const [showUncategorized, setShowUncategorized] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [categories, setCategories] = useState({});
  const navigate = useNavigate();

  // Estrutura das categorias financeiras (mantida do original)
  const financialCategories = {
    "1. RECEITA": {
      order: 1,
      displayName: "RECEITA",
      isRevenue: true,
      isTotal: false,
    },
    "2. (-) DEDUÇÕES DA RECEITA": {
      order: 2,
      displayName: "(-) DEDUÇÕES DA RECEITA",
      isRevenue: false,
      isTotal: false,
    },
    "3. (=) RECEITA LÍQUIDA": {
      order: 3,
      displayName: "(=) RECEITA LÍQUIDA",
      isTotal: true,
      formula: (data) => {
        return (data["1. RECEITA"]?.total || 0) - (data["2. (-) DEDUÇÕES DA RECEITA"]?.total || 0);
      }
    },
    "4. (+) OUTRAS RECEITAS OPERACIONAIS E NÃO OPERACIONAIS": {
      order: 4,
      displayName: "(+) OUTRAS RECEITAS OPERACIONAIS E NÃO OPERACIONAIS",
      isRevenue: true,
      isTotal: false,
    },
    "5. (-) CUSTOS DAS MERCADORIAS VENDIDAS (CMV)": {
      order: 5,
      displayName: "(-) CUSTOS DAS MERCADORIAS VENDIDAS (CMV)",
      isRevenue: false,
      isTotal: false,
    },
    "6. (=) LUCRO BRUTO": {
      order: 6,
      displayName: "(=) LUCRO BRUTO",
      isTotal: true,
      formula: (data) => {
        return (data["3. (=) RECEITA LÍQUIDA"]?.total || 0) + 
               (data["4. (+) OUTRAS RECEITAS OPERACIONAIS E NÃO OPERACIONAIS"]?.total || 0) - 
               (data["5. (-) CUSTOS DAS MERCADORIAS VENDIDAS (CMV)"]?.total || 0);
      }
    },
    "7. (-) DESPESAS OPERACIONAIS": {
      order: 7,
      displayName: "(-) DESPESAS OPERACIONAIS",
      isRevenue: false,
      isTotal: false,
    },
    "8. (-) DESPESAS COM SÓCIOS": {
      order: 8,
      displayName: "(-) DESPESAS COM SÓCIOS",
      isRevenue: false,
      isTotal: false,
    },
    "9. (-) INVESTIMENTOS": {
      order: 9,
      displayName: "(-) INVESTIMENTOS",
      isRevenue: false,
      isTotal: false,
    },
    "10. (=) LUCRO LÍQUIDO": {
      order: 10,
      displayName: "(=) LUCRO LÍQUIDO",
      isTotal: true,
      formula: (data) => {
        return (data["6. (=) LUCRO BRUTO"]?.total || 0) - 
               (data["7. (-) DESPESAS OPERACIONAIS"]?.total || 0) - 
               (data["8. (-) DESPESAS COM SÓCIOS"]?.total || 0) - 
               (data["9. (-) INVESTIMENTOS"]?.total || 0);
      }
    }
  };

  // Carregar períodos disponíveis
  useEffect(() => {
    const loadPeriods = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Buscar períodos únicos de transações
        const transactionsQuery = query(
          collection(db, "transactions"),
          where("userId", "==", currentUser.uid),
          orderBy("period", "desc")
        );

        const querySnapshot = await getDocs(transactionsQuery);
        const uniquePeriods = new Set();
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.period && data.periodLabel) {
            uniquePeriods.add(JSON.stringify({ 
              period: data.period, 
              label: data.periodLabel 
            }));
          }
        });

        const periodsArray = Array.from(uniquePeriods)
          .map(periodString => JSON.parse(periodString))
          .sort((a, b) => b.period.localeCompare(a.period));
        
        setPeriods(periodsArray);
        
        if (periodsArray.length > 0) {
          setSelectedPeriod(periodsArray[0].period);
        }
      } catch (error) {
        console.error("Erro ao carregar períodos:", error);
      }
    };

    loadPeriods();
  }, []);

  // Carregar categorias do usuário para o uso na aba de categorização
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Buscar categorias do usuário
        const userCategoriesDoc = await getDoc(doc(db, "userCategories", currentUser.uid));
        
        if (userCategoriesDoc.exists()) {
          const categoriesData = userCategoriesDoc.data();
          
          // Processar categorias em um formato mais utilizável
          if (categoriesData.categories) {
            const categoriesByGroup = {};
            
            Object.keys(categoriesData.categories).forEach(path => {
              if (categoriesData.categories[path]) {
                const parts = path.split('.');
                if (parts.length === 2) {
                  const group = parts[0];
                  const item = parts[1];
                  
                  if (!categoriesByGroup[group]) {
                    categoriesByGroup[group] = {
                      items: []
                    };
                  }
                  
                  categoriesByGroup[group].items.push(item);
                }
              }
            });
            
            setCategories(categoriesByGroup);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    };
    
    loadCategories();
  }, []);

  // Carregar transações quando o período for selecionado
  useEffect(() => {
    if (!selectedPeriod) {
      setLoading(false);
      return;
    }

    const loadTransactions = async () => {
      try {
        setLoading(true);
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Buscar todas as transações do período selecionado
        const transactionsQuery = query(
          collection(db, "transactions"),
          where("userId", "==", currentUser.uid),
          where("period", "==", selectedPeriod)
        );

        const querySnapshot = await getDocs(transactionsQuery);
        const transactionsData = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          transactionsData.push({
            id: doc.id,
            ...data,
            date: data.date?.toDate() || new Date(),
          });
        });

        // Buscar transações não categorizadas do período
        const ofxFilesQuery = query(
          collection(db, "ofxFiles"),
          where("userId", "==", currentUser.uid),
          where("period", "==", selectedPeriod)
        );

        const ofxSnapshot = await getDocs(ofxFilesQuery);
        let uncategorizedTxs = [];
        let processedTxIds = new Set(transactionsData.map(tx => tx.transactionId));

        ofxSnapshot.forEach((doc) => {
          const fileData = doc.data();
          
          if (fileData.rawTransactions && Array.isArray(fileData.rawTransactions)) {
            // Filtrar transações que não foram processadas
            const uncategorizedInFile = fileData.rawTransactions.filter(
              tx => !processedTxIds.has(tx.id)
            );
            
            uncategorizedTxs = [...uncategorizedTxs, ...uncategorizedInFile];
          }
        });

        setTransactions(transactionsData);
        setUncategorizedCount(uncategorizedTxs.length);
        setUncategorizedAmount(uncategorizedTxs.reduce((total, tx) => total + (tx.amount || 0), 0));
      } catch (error) {
        console.error("Erro ao carregar transações:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [selectedPeriod]);

  // Processar transações para o formato DRE
  useEffect(() => {
    if (transactions.length === 0 && !loading) {
      // Inicializar dados vazios para o DRE
      const emptyData = {};
      Object.keys(financialCategories).forEach(key => {
        if (!financialCategories[key].isTotal) {
          emptyData[key] = {
            categories: {},
            total: 0
          };
        }
      });
      setDreData(emptyData);
      return;
    }

    if (transactions.length > 0) {
      // Agrupar transações por categoria
      const data = {};
      
      // Inicializar categorias
      Object.keys(financialCategories).forEach(key => {
        if (!financialCategories[key].isTotal) {
          data[key] = {
            categories: {},
            total: 0
          };
        }
      });
      
      // Processar transações
      transactions.forEach(transaction => {
        if (transaction.groupName && transaction.category && transaction.amount) {
          const groupKey = Object.keys(financialCategories).find(
            key => financialCategories[key].displayName === transaction.groupName
          );
          
          if (groupKey) {
            // Adicionar à categoria específica
            if (!data[groupKey].categories[transaction.category]) {
              data[groupKey].categories[transaction.category] = 0;
            }
            
            // Decidir como adicionar o valor com base no tipo de categoria
            if (financialCategories[groupKey].isRevenue) {
              // Para receitas, valores positivos aumentam o total, negativos diminuem
              data[groupKey].categories[transaction.category] += transaction.amount;
            } else {
              // Para despesas e custos, valores negativos aumentam o total (em valor absoluto)
              data[groupKey].categories[transaction.category] += Math.abs(transaction.amount);
            }
          }
        }
      });
      
      // Calcular totais de cada grupo
      Object.keys(data).forEach(key => {
        data[key].total = Object.values(data[key].categories).reduce((sum, value) => sum + value, 0);
      });
      
      // Calcular totais calculados (receita líquida, lucro bruto, lucro líquido)
      Object.keys(financialCategories).forEach(key => {
        if (financialCategories[key].isTotal && financialCategories[key].formula) {
          data[key] = {
            total: financialCategories[key].formula(data),
            isCalculated: true
          };
        }
      });
      
      setDreData(data);
    }
  }, [transactions, financialCategories, loading]);

  // Função para lidar com transações não categorizadas
  const handleCategorizeClick = () => {
    setActiveTab("categorize"); // Nova aba de categorização
  };

  // Recarregar dados
  const refreshDashboard = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      
      if (!currentUser || !selectedPeriod) {
        setLoading(false);
        return;
      }

      // Recarregar transações
      const transactionsQuery = query(
        collection(db, "transactions"),
        where("userId", "==", currentUser.uid),
        where("period", "==", selectedPeriod)
      );

      const querySnapshot = await getDocs(transactionsQuery);
      const transactionsData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactionsData.push({
          id: doc.id,
          ...data,
          date: data.date?.toDate() || new Date(),
        });
      });

      // Recalcular transações não categorizadas
      const ofxFilesQuery = query(
        collection(db, "ofxFiles"),
        where("userId", "==", currentUser.uid),
        where("period", "==", selectedPeriod)
      );

      const ofxSnapshot = await getDocs(ofxFilesQuery);
      let uncategorizedTxs = [];
      let processedTxIds = new Set(transactionsData.map(tx => tx.transactionId));

      ofxSnapshot.forEach((doc) => {
        const fileData = doc.data();
        
        if (fileData.rawTransactions && Array.isArray(fileData.rawTransactions)) {
          const uncategorizedInFile = fileData.rawTransactions.filter(
            tx => !processedTxIds.has(tx.id)
          );
          
          uncategorizedTxs = [...uncategorizedTxs, ...uncategorizedInFile];
        }
      });

      setTransactions(transactionsData);
      setUncategorizedCount(uncategorizedTxs.length);
      setUncategorizedAmount(uncategorizedTxs.reduce((total, tx) => total + (tx.amount || 0), 0));
    } catch (error) {
      console.error("Erro ao recarregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Formatar valor para exibição
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Verificar se um valor é positivo (para estilização)
  const isPositive = (value) => {
    return value >= 0;
  };

  if (loading) {
    return (
      <div className="dre-loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div className="loading-spinner" style={styles.loadingSpinner}></div>
        <p style={{ marginLeft: '15px', color: '#666' }}>Carregando dados financeiros...</p>
      </div>
    );
  }

  return (
    <div className="dre-new-container" style={styles.container}>
      {/* Header */}
      <div className="dre-new-header" style={styles.header}>
        <h1 style={styles.heading}>Dashboard Financeiro</h1>
        
        <div className="dre-new-period-selector" style={styles.periodSelector}>
          <label style={styles.label} htmlFor="period-select">Período:</label>
          <select 
            id="period-select"
            style={styles.select}
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            {periods.length === 0 ? (
              <option value="">Nenhum período disponível</option>
            ) : (
              periods.map((period) => (
                <option key={period.period} value={period.period}>
                  {period.label}
                </option>
              ))
            )}
          </select>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="checkbox" 
              id="compare-periods"
              checked={false} // Placeholder para funcionalidade futura
              onChange={() => {}} // Placeholder para funcionalidade futura
            />
            <label htmlFor="compare-periods" style={{ color: '#666', fontSize: '14px' }}>
              Comparar períodos
            </label>
          </div>
        </div>
      </div>

      {/* Tabs de navegação - Adicionada a nova aba "Categorizar" */}
      <div className="dre-new-tabs" style={styles.tabContainer}>
        <button 
          className="dre-new-tab"
          style={{
            ...styles.tab,
            ...(activeTab === 'overview' ? styles.tabActive : {})
          }}
          onClick={() => setActiveTab('overview')}
        >
          Visão Geral
        </button>
        <button 
          className="dre-new-tab"
          style={{
            ...styles.tab,
            ...(activeTab === 'details' ? styles.tabActive : {})
          }}
          onClick={() => setActiveTab('details')}
        >
          Detalhamento
        </button>
        <button 
          className="dre-new-tab"
          style={{
            ...styles.tab,
            ...(activeTab === 'trends' ? styles.tabActive : {})
          }}
          onClick={() => setActiveTab('trends')}
        >
          Tendências
        </button>
        <button 
          className="dre-new-tab"
          style={{
            ...styles.tab,
            ...(activeTab === 'categories' ? styles.tabActive : {})
          }}
          onClick={() => setActiveTab('categories')}
        >
          Categorias
        </button>
        <button 
          className="dre-new-tab"
          style={{
            ...styles.tab,
            ...(activeTab === 'categorize' ? styles.tabActive : {}),
            ...(uncategorizedCount > 0 ? { position: 'relative' } : {})
          }}
          onClick={() => setActiveTab('categorize')}
        >
          Categorizar
          {uncategorizedCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              backgroundColor: '#ff5252',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {uncategorizedCount > 99 ? '99+' : uncategorizedCount}
            </span>
          )}
        </button>
      </div>

      {/* Alerta para transações não categorizadas (exibir apenas nas abas relevantes) */}
      {uncategorizedCount > 0 && activeTab !== 'categorize' && (
        <div className="dre-new-alert" style={styles.alert}>
          <div style={styles.alertIcon}>⚠️</div>
          <div style={styles.alertContent}>
            <p style={styles.alertText}>
              <strong>Atenção:</strong> Existem {uncategorizedCount} transações não categorizadas 
              {uncategorizedAmount !== 0 && ` no valor de ${formatCurrency(uncategorizedAmount)}`}.
            </p>
            <p style={styles.alertText}>
              {showUncategorized ? 
                "Os valores não categorizados estão incluídos no cálculo, mas podem afetar a precisão do seu DRE." :
                "Os valores não categorizados não estão incluídos no cálculo atual."}
            </p>
            <div style={styles.alertActions}>
              <button 
                className="dre-new-categorize"
                style={styles.categorizeButton}
                onClick={handleCategorizeClick}
              >
                Categorizar Transações
              </button>
              <button 
                className="dre-new-toggle"
                style={styles.toggleButton}
                onClick={() => setShowUncategorized(!showUncategorized)}
              >
                {showUncategorized ? "Ocultar do cálculo" : "Incluir no cálculo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo principal baseado na aba ativa */}
      {activeTab === 'overview' && (
        <div className="dre-new-overview">
          {/* Cards de KPI */}
          <div style={styles.kpiContainer}>
            <div style={styles.kpiCard}>
              <h3 style={styles.kpiTitle}>Receita Total</h3>
              <p style={styles.kpiValue}>{formatCurrency(dreData['1. RECEITA']?.total || 0)}</p>
            </div>
            <div style={styles.kpiCard}>
              <h3 style={styles.kpiTitle}>Despesas Totais</h3>
              <p style={styles.kpiValue}>{formatCurrency((dreData['7. (-) DESPESAS OPERACIONAIS']?.total || 0) + 
                (dreData['8. (-) DESPESAS COM SÓCIOS']?.total || 0))}</p>
            </div>
            <div style={styles.kpiCard}>
              <h3 style={styles.kpiTitle}>Lucro Bruto</h3>
              <p style={styles.kpiValue}>{formatCurrency(dreData['6. (=) LUCRO BRUTO']?.total || 0)}</p>
            </div>
            <div style={styles.kpiCard}>
              <h3 style={styles.kpiTitle}>Lucro Líquido</h3>
              <p style={styles.kpiValue}>{formatCurrency(dreData['10. (=) LUCRO LÍQUIDO']?.total || 0)}</p>
            </div>
          </div>

          {/* Placeholder para gráficos */}
          <div style={styles.chartPlaceholder}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Evolução Mensal</h3>
            <p style={{ margin: 0, color: '#666' }}>
              Gráfico de evolução mensal será exibido aqui quando o Recharts for configurado.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={styles.chartPlaceholder}>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Receitas por Categoria</h3>
              <p style={{ margin: 0, color: '#666' }}>
                Gráfico de receitas por categoria será exibido aqui.
              </p>
            </div>
            <div style={styles.chartPlaceholder}>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Despesas por Categoria</h3>
              <p style={{ margin: 0, color: '#666' }}>
                Gráfico de despesas por categoria será exibido aqui.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'details' && (
        <div className="dre-new-details" style={styles.detailsContainer}>
          <div style={styles.tableHeader}>
            <h3 style={{ margin: 0, color: '#333', fontSize: '18px', fontWeight: '600' }}>
              Demonstração de Resultado
            </h3>
            <div style={styles.tableActions}>
              <button style={styles.actionButton} onClick={() => window.print()}>
                Imprimir
              </button>
              <button style={styles.actionButton} onClick={() => 
                alert("Funcionalidade de exportação será implementada em breve.")
              }>
                Exportar
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead style={styles.tableHead}>
                <tr>
                  <th style={styles.tableHeadCell}>Categoria</th>
                  <th style={{ ...styles.tableHeadCell, textAlign: 'right' }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(financialCategories)
                  .sort((a, b) => financialCategories[a].order - financialCategories[b].order)
                  .map((groupKey) => {
                    const group = financialCategories[groupKey];
                    const groupData = dreData[groupKey];
                    
                    if (!groupData && !group.isTotal) return null;
                    
                    return (
                      <React.Fragment key={groupKey}>
                        {/* Linha do grupo */}
                        <tr style={group.isTotal ? styles.totalRow : styles.groupRow}>
                          <td style={{ ...styles.tableCell, ...styles.groupName }}>
                            {group.displayName}
                          </td>
                          <td style={{ 
                            ...styles.tableCell, 
                            textAlign: 'right',
                            fontWeight: 'bold',
                            color: isPositive(groupData?.total) ? '#4caf50' : '#f44336'
                          }}>
                            {formatCurrency(groupData?.total || 0)}
                          </td>
                        </tr>
                        
                        {/* Categorias dentro do grupo */}
                        {!group.isTotal && groupData && Object.keys(groupData.categories || {}).length > 0 && 
                          Object.entries(groupData.categories)
                            .sort(([, valueA], [, valueB]) => Math.abs(valueB) - Math.abs(valueA))
                            .map(([category, value]) => (
                              <tr key={`${groupKey}-${category}`}>
                                <td style={{ 
                                  ...styles.tableCell, 
                                  paddingLeft: '40px',
                                  position: 'relative'
                                }}>
                                  <span style={{ 
                                    position: 'absolute', 
                                    left: '20px', 
                                    color: '#4285f4'
                                  }}>•</span>
                                  {category}
                                </td>
                                <td style={{ 
                                  ...styles.tableCell, 
                                  textAlign: 'right',
                                  color: '#666'
                                }}>
                                  {formatCurrency(value)}
                                </td>
                              </tr>
                            ))
                        }
                      </React.Fragment>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="dre-new-trends">
          <div style={styles.chartPlaceholder}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Tendências de Receita e Despesa</h3>
            <p style={{ margin: 0, color: '#666' }}>
              Gráficos de tendências serão exibidos aqui quando o Recharts for configurado.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="dre-new-categories">
          <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '18px', fontWeight: '600' }}>
            Categorias Financeiras
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '20px',
            marginBottom: '30px'
          }}>
            {Object.keys(financialCategories)
              .filter(key => !financialCategories[key].isTotal)
              .sort((a, b) => financialCategories[a].order - financialCategories[b].order)
              .map(key => {
                const group = financialCategories[key];
                const groupData = dreData[key];
                const categoriesList = groupData?.categories ? Object.keys(groupData.categories) : [];
                
                // Determinar cor baseada na categoria
                let bgColor = '#f5f5f5';
                let borderColor = '#4285f4';
                
                if (key.includes("RECEITA")) {
                  bgColor = '#e3f2fd';
                  borderColor = '#2196f3';
                } else if (key.includes("DESPESAS") || key.includes("CUSTOS") || key.includes("INVESTIMENTOS")) {
                  bgColor = '#ffebee';
                  borderColor = '#f44336';
                }
                
                return (
                  <div key={key} style={{ 
                    backgroundColor: bgColor,
                    borderLeft: `4px solid ${borderColor}`,
                    borderRadius: '8px',
                    padding: '20px'
                  }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>
                      {group.displayName}
                    </h4>
                    <ul style={{ 
                      listStyle: 'none', 
                      padding: 0,
                      margin: 0
                    }}>
                      {categoriesList.slice(0, 5).map((cat, idx) => (
                        <li key={idx} style={{ 
                          padding: '5px 0',
                          position: 'relative',
                          paddingLeft: '20px'
                        }}>
                          <span style={{
                            position: 'absolute',
                            left: '0',
                            color: borderColor
                          }}>•</span>
                          {cat}
                        </li>
                      ))}
                      {categoriesList.length > 5 && (
                        <li style={{ 
                          padding: '5px 0',
                          paddingLeft: '20px',
                          position: 'relative'
                        }}>
                          <span style={{
                            position: 'absolute',
                            left: '0',
                            color: borderColor
                          }}>•</span>
                          +{categoriesList.length - 5} mais...
                        </li>
                      )}
                      {categoriesList.length === 0 && (
                        <li style={{ 
                          padding: '5px 0',
                          fontStyle: 'italic',
                          color: '#999'
                        }}>
                          Nenhuma categoria com transações
                        </li>
                      )}
                    </ul>
                  </div>
                );
              })
            }
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <button 
              style={{
                padding: '10px 20px',
                backgroundColor: '#4285f4',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
              onClick={() => navigate('/select-categories')}
            >
              Editar Categorias
            </button>
          </div>
        </div>
      )}

      {/* Nova aba de categorização */}
      {activeTab === 'categorize' && (
        <DreCategorizationTab 
          selectedPeriod={selectedPeriod}
          categories={categories}
          financialCategories={financialCategories}
          refreshDashboard={refreshDashboard}
        />
      )}
    </div>
  );
};

export default DRE;