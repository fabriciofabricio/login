// src/components/DRE/DRE.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/config";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import "./DRE.css";

const DRE = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [dreData, setDreData] = useState({});
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [uncategorizedCount, setUncategorizedCount] = useState(0);
  const [uncategorizedAmount, setUncategorizedAmount] = useState(0);
  const [showUncategorized, setShowUncategorized] = useState(true);
  const navigate = useNavigate();

  // Estrutura das categorias financeiras (igual à existente no CategorySelection.js)
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
  }, [transactions]);

  // Navegar para a página de categorização
  const handleCategorizeClick = () => {
    navigate("/transactions");
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
      <div className="dre-loading">
        <div className="loading-spinner"></div>
        <p>Carregando dados financeiros...</p>
      </div>
    );
  }

  return (
    <div className="dre-container">
      <div className="dre-header">
        <h1>Demonstração do Resultado do Exercício (DRE)</h1>
        
        <div className="period-selector">
          <label htmlFor="period-select">Período:</label>
          <select 
            id="period-select" 
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
        </div>
      </div>
      
      {periods.length === 0 ? (
        <div className="dre-empty-state">
          <p>Nenhum dado financeiro disponível. Comece importando um extrato bancário.</p>
          <button 
            className="navigate-button"
            onClick={() => navigate("/transactions")}
          >
            Importar Extrato
          </button>
        </div>
      ) : (
        <>
          {uncategorizedCount > 0 && (
            <div className="uncategorized-alert">
              <div className="alert-content">
                <div className="alert-icon">⚠️</div>
                <div className="alert-message">
                  <p>
                    <strong>Atenção:</strong> Existem {uncategorizedCount} transações não categorizadas 
                    {uncategorizedAmount !== 0 && ` no valor de ${formatCurrency(uncategorizedAmount)}`}.
                  </p>
                  <p>
                    {showUncategorized ? 
                      "Os valores não categorizados estão incluídos no cálculo, mas podem afetar a precisão do seu DRE." :
                      "Os valores não categorizados não estão incluídos no cálculo atual."}
                  </p>
                </div>
                <div className="alert-actions">
                  <button className="categorize-button" onClick={handleCategorizeClick}>
                    Categorizar Transações
                  </button>
                  <button 
                    className="toggle-uncategorized"
                    onClick={() => setShowUncategorized(!showUncategorized)}
                  >
                    {showUncategorized ? "Ocultar do cálculo" : "Incluir no cálculo"}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="dre-table-container">
            <table className="dre-table">
              <thead>
                <tr>
                  <th className="category-column">Categoria</th>
                  <th className="value-column">Valor</th>
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
                        <tr className={`group-row ${group.isTotal ? 'total-row' : ''}`}>
                          <td className="group-name">{group.displayName}</td>
                          <td className={`group-value ${isPositive(groupData?.total) ? 'positive' : 'negative'}`}>
                            {formatCurrency(groupData?.total || 0)}
                          </td>
                        </tr>
                        
                        {/* Categorias dentro do grupo (apenas para grupos não calculados) */}
                        {!group.isTotal && groupData && Object.keys(groupData.categories).length > 0 && 
                          Object.entries(groupData.categories)
                            .sort(([, valueA], [, valueB]) => Math.abs(valueB) - Math.abs(valueA))
                            .map(([category, value]) => (
                              <tr key={`${groupKey}-${category}`} className="category-row">
                                <td className="category-name">{category}</td>
                                <td className={`category-value ${isPositive(value) ? 'positive' : 'negative'}`}>
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
          
          <div className="dre-actions">
            <button className="print-button" onClick={() => window.print()}>
              Imprimir DRE
            </button>
            <button 
              className="export-button" 
              onClick={() => {
                alert("Funcionalidade de exportação será implementada em breve.");
              }}
            >
              Exportar para Excel
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DRE;