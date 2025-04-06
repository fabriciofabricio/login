// src/utils/dreDataProcessor.js
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * Busca transações para um período específico combinando dados de OFX com mapeamentos de categorias
 * @param {string} userId - ID do usuário
 * @param {string} period - Período (YYYY-MM)
 * @returns {Promise<Array>} - Promise com array de transações processadas
 */
export const fetchTransactionsForPeriod = async (userId, period) => {
  try {
    // 1. Buscar todos os arquivos OFX do período
    const ofxFilesQuery = query(
      collection(db, "ofxFiles"),
      where("userId", "==", userId),
      where("period", "==", period)
    );
    
    const ofxSnapshot = await getDocs(ofxFilesQuery);
    let rawTransactions = [];
    
    // Coletar todas as transações brutas dos arquivos OFX
    ofxSnapshot.forEach((doc) => {
      const fileData = doc.data();
      if (fileData.rawTransactions && Array.isArray(fileData.rawTransactions)) {
        // Adicionar metadados do período
        const txsWithMetadata = fileData.rawTransactions.map(tx => ({
          ...tx,
          date: tx.date instanceof Date ? tx.date : new Date(tx.date),
          period: fileData.period,
          periodLabel: fileData.periodLabel,
          month: fileData.month,
          year: fileData.year
        }));
        
        rawTransactions = [...rawTransactions, ...txsWithMetadata];
      }
    });
    
    // 2. Buscar os mapeamentos de categorias
    const categoryMappingsDoc = await getDoc(doc(db, "categoryMappings", userId));
    const categoryMappings = categoryMappingsDoc.exists() ? categoryMappingsDoc.data().mappings || {} : {};
    
    // 3. Aplicar mapeamentos de categorias às transações
    const processedTransactions = rawTransactions.map(transaction => {
      const normalizedDescription = transaction.description.trim().toLowerCase();
      
      // Verificar se existe um mapeamento para esta descrição
      if (categoryMappings[normalizedDescription]) {
        const mapping = categoryMappings[normalizedDescription];
        return {
          id: transaction.id,
          date: transaction.date,
          amount: transaction.amount,
          description: transaction.description,
          category: mapping.categoryName,
          categoryPath: mapping.categoryPath,
          groupName: mapping.groupName,
          period: transaction.period,
          periodLabel: transaction.periodLabel,
          month: transaction.month,
          year: transaction.year
        };
      }
      
      // Transação sem mapeamento (não categorizada)
      return transaction;
    });
    
    return processedTransactions;
  } catch (error) {
    console.error("Erro ao buscar transações para o período:", error);
    throw error;
  }
};

/**
 * Processa os dados de transações para o formato DRE
 * @param {Array} transactions - Array de transações
 * @param {Object} financialCategories - Definição das categorias financeiras
 * @returns {Object} - Dados processados no formato DRE
 */
export const processDreData = (transactions, financialCategories) => {
  // Inicializar dados vazios para o DRE
  const dreData = {};
  Object.keys(financialCategories).forEach(key => {
    if (!financialCategories[key].isTotal) {
      dreData[key] = {
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
        if (!dreData[groupKey].categories[transaction.category]) {
          dreData[groupKey].categories[transaction.category] = 0;
        }
        
        // Decidir como adicionar o valor com base no tipo de categoria
        if (financialCategories[groupKey].isRevenue) {
          // Para receitas, valores positivos aumentam o total, negativos diminuem
          dreData[groupKey].categories[transaction.category] += transaction.amount;
        } else {
          // Para despesas e custos, valores negativos aumentam o total (em valor absoluto)
          dreData[groupKey].categories[transaction.category] += Math.abs(transaction.amount);
        }
      }
    }
  });
  
  // Calcular totais de cada grupo
  Object.keys(dreData).forEach(key => {
    dreData[key].total = Object.values(dreData[key].categories).reduce((sum, value) => sum + value, 0);
  });
  
  // Calcular totais calculados (receita líquida, lucro bruto, lucro líquido)
  Object.keys(financialCategories).forEach(key => {
    if (financialCategories[key].isTotal && financialCategories[key].formula) {
      dreData[key] = {
        total: financialCategories[key].formula(dreData),
        isCalculated: true
      };
    }
  });
  
  return dreData;
};

/**
 * Busca transações não categorizadas para um período
 * @param {string} userId - ID do usuário
 * @param {string} period - Período (YYYY-MM)
 * @returns {Promise<Object>} - Contagem e valor das transações não categorizadas
 */
export const fetchUncategorizedTransactions = async (userId, period) => {
  try {
    // Buscar todos os arquivos OFX do período
    const ofxFilesQuery = query(
      collection(db, "ofxFiles"),
      where("userId", "==", userId),
      where("period", "==", period)
    );
    
    const ofxSnapshot = await getDocs(ofxFilesQuery);
    let rawTransactions = [];
    
    // Coletar todas as transações brutas dos arquivos OFX
    ofxSnapshot.forEach((doc) => {
      const fileData = doc.data();
      if (fileData.rawTransactions && Array.isArray(fileData.rawTransactions)) {
        rawTransactions = [...rawTransactions, ...fileData.rawTransactions];
      }
    });
    
    // Buscar os mapeamentos de categorias
    const categoryMappingsDoc = await getDoc(doc(db, "categoryMappings", userId));
    const categoryMappings = categoryMappingsDoc.exists() ? categoryMappingsDoc.data().mappings || {} : {};
    
    // Filtrar transações que não possuem mapeamento
    const uncategorizedTransactions = rawTransactions.filter(transaction => {
      const normalizedDescription = transaction.description.trim().toLowerCase();
      return !categoryMappings[normalizedDescription];
    });
    
    // Calcular o total de valores não categorizados
    const totalUncategorizedAmount = uncategorizedTransactions.reduce(
      (total, tx) => total + (tx.amount || 0), 
      0
    );
    
    return {
      count: uncategorizedTransactions.length,
      amount: totalUncategorizedAmount
    };
  } catch (error) {
    console.error("Erro ao buscar transações não categorizadas:", error);
    throw error;
  }
};

/**
 * Busca dados históricos mensais para gráficos de tendência
 * @param {string} userId - ID do usuário
 * @param {number} monthsCount - Número de meses para buscar
 * @returns {Promise<Array>} - Array de dados mensais
 */
export const fetchMonthlyTrendsData = async (userId, monthsCount = 6) => {
  try {
    const monthlyData = [];
    const currentDate = new Date();
    
    // Busca dados para cada mês
    for (let i = 0; i < monthsCount; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      // Buscar transações do período
      const transactions = await fetchTransactionsForPeriod(userId, period);
      
      // Calcular totais
      let revenue = 0;
      let expenses = 0;
      
      transactions.forEach(tx => {
        if (tx.groupName === "RECEITA" || tx.groupName === "OUTRAS RECEITAS OPERACIONAIS E NÃO OPERACIONAIS") {
          revenue += tx.amount;
        } else if (tx.amount < 0 || tx.groupName?.startsWith("(-)")) {
          expenses += Math.abs(tx.amount);
        }
      });
      
      // Adicionar ao array de dados mensais
      monthlyData.push({
        month: date.toLocaleString('pt-BR', { month: 'short' }),
        revenue,
        expenses,
        profit: revenue - expenses,
        period
      });
    }
    
    // Inverter para ordem cronológica
    return monthlyData.reverse();
  } catch (error) {
    console.error("Erro ao buscar dados de tendências mensais:", error);
    throw error;
  }
};

/**
 * Compara dados de dois períodos e calcula variações percentuais
 * @param {Object} currentData - Dados DRE do período atual
 * @param {Object} previousData - Dados DRE do período anterior
 * @returns {Object} - Objeto com percentuais de variação
 */
export const comparePeriods = (currentData, previousData) => {
  const variations = {};
  
  // Processa cada categoria principal
  Object.keys(currentData).forEach(key => {
    if (currentData[key] && previousData && previousData[key]) {
      const currentTotal = currentData[key].total || 0;
      const previousTotal = previousData[key].total || 0;
      
      // Calcular variação percentual
      let variation = 0;
      if (previousTotal !== 0) {
        variation = (currentTotal - previousTotal) / Math.abs(previousTotal);
      }
      
      variations[key] = {
        current: currentTotal,
        previous: previousTotal,
        variation,
        difference: currentTotal - previousTotal
      };
    }
  });
  
  return variations;
};