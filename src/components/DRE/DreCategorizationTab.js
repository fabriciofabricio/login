// src/components/DRE/DreCategorizationTab.js
import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase/config";
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp
} from "firebase/firestore";

const style = {
  container: {
    padding: '20px 0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  headerTitle: {
    margin: 0,
    color: '#333',
    fontSize: '18px',
    fontWeight: '600',
  },
  statsContainer: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#4285f4',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
  },
  filtersContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: '1',
    minWidth: '200px',
    padding: '10px 16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  dropdown: {
    padding: '10px 16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white',
    fontSize: '14px',
    minWidth: '200px',
  },
  transactionsList: {
    marginBottom: '20px',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  },
  transactionItem: {
    display: 'flex',
    borderBottom: '1px solid #eee',
    backgroundColor: 'white',
    transition: 'background-color 0.2s',
    padding: '16px',
    alignItems: 'center',
  },
  transactionItemHover: {
    backgroundColor: '#f9f9f9',
  },
  transactionItemSelected: {
    backgroundColor: '#e3f2fd',
  },
  transactionDate: {
    width: '100px',
    color: '#666',
    fontWeight: '500',
  },
  transactionDescription: {
    flex: '2',
  },
  transactionAmount: {
    width: '150px',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  positiveAmount: {
    color: '#4caf50',
  },
  negativeAmount: {
    color: '#f44336',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    marginRight: '16px',
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '20px',
  },
  paginationButton: {
    padding: '8px 16px',
    border: '1px solid #d0d0d0',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
    color: '#4285f4',
    minWidth: '40px',
    textAlign: 'center',
    fontWeight: '500',
    margin: '0 4px',
    transition: 'all 0.2s ease',
    display: 'inline-block',
  },
  paginationButtonActive: {
    backgroundColor: '#4285f4',
    color: 'white',
    borderColor: '#4285f4',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    minWidth: '40px',
    textAlign: 'center',
    fontWeight: '500',
    margin: '0 4px',
    transition: 'all 0.2s ease',
    display: 'inline-block',
  },
  paginationEllipsis: {
    display: 'inline-block',
    padding: '8px 12px',
    color: '#666',
  },
  noTransactions: {
    padding: '40px',
    textAlign: 'center',
    backgroundColor: 'white',
    color: '#666',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  },
  infoCard: {
    backgroundColor: '#f5f9ff', 
    border: '1px solid #d0e1fd', 
    borderRadius: '8px', 
    padding: '16px', 
    marginBottom: '24px'
  },
  infoTitle: {
    margin: '0 0 8px 0',
    color: '#2c5282',
    fontSize: '16px'
  },
  infoText: {
    margin: '0 0 8px 0',
    color: '#4a5568',
    fontSize: '14px'
  },
  quickCategorizeCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    marginBottom: '24px',
  },
  quickCategorizeTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginTop: 0,
    marginBottom: '16px',
  },
  patternContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '16px',
  },
  patternItem: {
    backgroundColor: '#f1f8ff',
    border: '1px solid #c8e1ff',
    borderRadius: '4px',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
  },
  patternCount: {
    backgroundColor: '#4285f4',
    color: 'white',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '8px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: '#4285f4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    marginLeft: 'auto',
    cursor: 'pointer',
    fontSize: '12px',
  },
  bulkActionsContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '20px',
  },
  bulkActionButton: {
    backgroundColor: '#4285f4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  categorySelector: {
    width: '100%',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
  },
  loadingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '3px solid #e0e0e0',
    borderTopColor: '#4285f4',
    animation: 'spin 1s linear infinite',
  },
  progressContainer: {
    position: 'relative',
    height: '10px',
    backgroundColor: '#e0e0e0',
    borderRadius: '5px',
    overflow: 'hidden',
    margin: '10px 0 20px',
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#4caf50',
    transition: 'width 0.3s ease',
  },
  progressText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#666',
    marginBottom: '5px',
  },
  suggestionChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '8px',
  },
  suggestionChip: {
    padding: '4px 12px',
    background: '#f0f4f8',
    borderRadius: '16px',
    fontSize: '12px',
    cursor: 'pointer',
    border: '1px solid #d0d9e0',
  },
  bottomButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '32px',
  },
  saveAllButton: {
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '12px 24px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
  }
};

const DreCategorizationTab = ({ selectedPeriod, categories, financialCategories, refreshDashboard }) => {
  const [uncategorizedTransactions, setUncategorizedTransactions] = useState([]);
  const [similarPatterns, setSimilarPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('date');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [categorySuggestions, setCategorySuggestions] = useState({});
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [categoryMappings, setCategoryMappings] = useState({});
  
  const itemsPerPage = 10;

  // Carregar transações não categorizadas
  useEffect(() => {
    if (!selectedPeriod) {
      setLoading(false);
      return;
    }

    const loadUncategorizedTransactions = async () => {
      setLoading(true);
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // 1. Carregar mapeamentos de categorias
        const mappingsDocRef = doc(db, "categoryMappings", currentUser.uid);
        const mappingsDoc = await getDoc(mappingsDocRef);
        const mappings = mappingsDoc.exists() ? mappingsDoc.data().mappings || {} : {};
        setCategoryMappings(mappings);
        
        // 2. Buscar arquivos OFX do período
        const ofxFilesQuery = query(
          collection(db, "ofxFiles"),
          where("userId", "==", currentUser.uid),
          where("period", "==", selectedPeriod)
        );

        const ofxSnapshot = await getDocs(ofxFilesQuery);
        let allTransactions = [];

        ofxSnapshot.forEach((doc) => {
          const fileData = doc.data();
          
          if (fileData.rawTransactions && Array.isArray(fileData.rawTransactions)) {
            // Adicionar metadados do período às transações
            const txsWithMetadata = fileData.rawTransactions.map(tx => ({
              ...tx,
              date: tx.date instanceof Date ? tx.date : new Date(tx.date),
              fileId: doc.id,
              period: fileData.period,
              periodLabel: fileData.periodLabel,
              month: fileData.month,
              year: fileData.year
            }));
            
            allTransactions = [...allTransactions, ...txsWithMetadata];
          }
        });

        // 3. Filtrar transações que não têm mapeamento de categoria
        const uncategorizedTxs = allTransactions.filter(tx => {
          const normalizedDescription = tx.description?.trim().toLowerCase();
          if (!normalizedDescription) return true;
          
          // Verificar match exato
          if (mappings[normalizedDescription]) return false;
          
          // Verificar padrões
          for (const [pattern, mapping] of Object.entries(mappings)) {
            if (!pattern.includes('*')) continue;
            
            let isMatch = false;
            
            if (pattern.startsWith('*') && pattern.endsWith('*')) {
              // Padrão de substring (*PALAVRA*)
              const keyword = pattern.substring(1, pattern.length - 1);
              isMatch = normalizedDescription.includes(keyword);
            } else if (pattern.startsWith('*')) {
              // Padrão de sufixo (*PALAVRA)
              const suffix = pattern.substring(1);
              isMatch = normalizedDescription.endsWith(suffix);
            } else if (pattern.endsWith('*')) {
              // Padrão de prefixo (PALAVRA*)
              const prefix = pattern.substring(0, pattern.length - 1);
              isMatch = normalizedDescription.startsWith(prefix);
            }
            
            if (isMatch) return false;
          }
          
          return true;
        });
        
        // Ordenar por data (mais recente primeiro)
        uncategorizedTxs.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setUncategorizedTransactions(uncategorizedTxs);
        setFilteredTransactions(uncategorizedTxs);
        setProgress({ 
          completed: allTransactions.length - uncategorizedTxs.length, 
          total: allTransactions.length 
        });
        
        // Identificar padrões similares para categorização rápida
        findSimilarPatterns(uncategorizedTxs);
        
        // Gerar sugestões de categorias com base em descrições
        generateCategorySuggestions(uncategorizedTxs);
      } catch (error) {
        console.error("Erro ao carregar transações não categorizadas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUncategorizedTransactions();
  }, [selectedPeriod]);

  // Transforma categorias no formato necessário para a interface
  const formatCategoriesForDropdown = () => {
    const dropdownOptions = [];
    
    Object.keys(financialCategories)
      .filter(key => !financialCategories[key].isTotal)
      .sort((a, b) => financialCategories[a].order - financialCategories[b].order)
      .forEach(groupKey => {
        const group = financialCategories[groupKey];
        
        // Adicionar grupo como optgroup
        dropdownOptions.push({
          group: group.displayName,
          options: []
        });
        
        // Adicionar categorias do grupo se existirem
        if (categories[group.displayName]?.items) {
          categories[group.displayName].items.forEach(category => {
            dropdownOptions[dropdownOptions.length - 1].options.push({
              value: `${group.displayName}.${category}`,
              label: category,
              group: group.displayName
            });
          });
        }
      });
    
    return dropdownOptions;
  };

  // Encontrar padrões similares para categorização rápida
  const findSimilarPatterns = (transactions) => {
    // Criar mapa de palavras-chave nas descrições
    const patterns = {};
    const ignoreWords = ['de', 'da', 'do', 'para', 'com', 'em', 'por', 'o', 'a', 'os', 'as'];
    
    transactions.forEach(tx => {
      if (!tx.description) return;
      
      // Identificar palavras-chave na descrição
      const words = tx.description.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length < 3 || ignoreWords.includes(word)) return;
        
        if (!patterns[word]) {
          patterns[word] = {
            count: 0,
            transactions: []
          };
        }
        
        patterns[word].count++;
        patterns[word].transactions.push(tx.id);
      });
    });
    
    // Filtrar padrões com pelo menos 3 ocorrências
    const significantPatterns = Object.entries(patterns)
      .filter(([_, data]) => data.count >= 3)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10) // Limitar aos 10 mais frequentes
      .map(([pattern, data]) => ({
        pattern,
        count: data.count,
        transactions: data.transactions
      }));
    
    setSimilarPatterns(significantPatterns);
  };

  // Gerar sugestões de categorias baseadas em descrições
  const generateCategorySuggestions = (transactions) => {
    const suggestions = {};
    
    // Palavras-chave simples para categorias comuns
    const keywordMap = {
      'supermercado': 'CUSTOS DAS MERCADORIAS VENDIDAS (CMV).Insumos e ingredientes',
      'mercado': 'CUSTOS DAS MERCADORIAS VENDIDAS (CMV).Insumos e ingredientes',
      'alimento': 'CUSTOS DAS MERCADORIAS VENDIDAS (CMV).Insumos e ingredientes',
      'energia': 'DESPESAS OPERACIONAIS.Energia Elétrica',
      'luz': 'DESPESAS OPERACIONAIS.Energia Elétrica',
      'internet': 'DESPESAS OPERACIONAIS.Internet',
      'telecom': 'DESPESAS OPERACIONAIS.Telefone e TV a Cabo',
      'telefone': 'DESPESAS OPERACIONAIS.Telefone e TV a Cabo',
      'aluguel': 'DESPESAS OPERACIONAIS.Aluguel',
      'locação': 'DESPESAS OPERACIONAIS.Aluguel',
      'material': 'DESPESAS OPERACIONAIS.Material de Escritório',
      'limpeza': 'DESPESAS OPERACIONAIS.Limpeza / Higiene',
      'serviço': 'DESPESAS OPERACIONAIS.Outras Despesas ADM',
      'salário': 'DESPESAS OPERACIONAIS.Salário',
      'pagamento': 'DESPESAS OPERACIONAIS.Outras Despesas ADM',
      'bebida': 'CUSTOS DAS MERCADORIAS VENDIDAS (CMV).Bebidas',
      'água': 'DESPESAS OPERACIONAIS.Água / Esgoto (Sanepar)',
      'pix': 'RECEITA.PIX',
      'maquininha': 'RECEITA.PIX'
    };
    
    transactions.forEach(tx => {
      if (!tx.description) return;
      
      const description = tx.description.toLowerCase();
      const txSuggestions = new Set();
      
      // Verificar palavras-chave
      Object.entries(keywordMap).forEach(([keyword, category]) => {
        if (description.includes(keyword)) {
          txSuggestions.add(category);
        }
      });
      
      // Verificar padrões específicos
      if (description.endsWith("- pix | maquininha") || description.endsWith("| maquininha")) {
        txSuggestions.add('RECEITA.PIX');
      }
      
      // Se for um valor negativo, provavelmente é uma despesa
      if (tx.amount < 0 && txSuggestions.size === 0) {
        txSuggestions.add('DESPESAS OPERACIONAIS.Outras Despesas ADM');
      }
      
      // Se for um valor positivo, provavelmente é uma receita
      if (tx.amount > 0 && txSuggestions.size === 0) {
        txSuggestions.add('RECEITA.Outras Entradas');
      }
      
      if (txSuggestions.size > 0) {
        suggestions[tx.id] = Array.from(txSuggestions);
      }
    });
    
    setCategorySuggestions(suggestions);
  };

  // Filtrar transações quando mudar a busca ou ordenação
  useEffect(() => {
    let filtered = [...uncategorizedTransactions];
    
    // Aplicar filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar ordenação
    if (sortOrder === 'date') {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortOrder === 'amount_desc') {
      filtered.sort((a, b) => b.amount - a.amount);
    } else if (sortOrder === 'amount_asc') {
      filtered.sort((a, b) => a.amount - b.amount);
    } else if (sortOrder === 'description') {
      filtered.sort((a, b) => a.description?.localeCompare(b.description));
    }
    
    setFilteredTransactions(filtered);
    setCurrentPage(1); // Voltar para a primeira página ao filtrar
  }, [searchTerm, sortOrder, uncategorizedTransactions]);

  // Formatar data para exibição
  const formatDate = (date) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('pt-BR');
  };

  // Formatar valor para exibição
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Manipular seleção de transações
  const handleToggleSelect = (id) => {
    setSelectedTransactions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Selecionar todas as transações na página atual
  const handleSelectAllInPage = () => {
    const currentPageItems = getCurrentPageItems();
    const newSelection = { ...selectedTransactions };
    
    currentPageItems.forEach(tx => {
      newSelection[tx.id] = true;
    });
    
    setSelectedTransactions(newSelection);
  };

  // Deselecionar todas as transações
  const handleDeselectAll = () => {
    setSelectedTransactions({});
  };

  // Nova função para detectar padrões comuns nas descrições
  const detectPatterns = (transactions) => {
    // Objeto para armazenar padrões detectados e suas transações correspondentes
    const patterns = {};
    
    // 1. Verificar se há padrões de sufixo (terminando com X)
    const suffixPatterns = {};
    transactions.forEach(tx => {
      const desc = tx.description?.trim();
      if (!desc) return;
      
      // Verificar por sufixos comuns
      const suffixes = [
        " - pix | maquininha",
        " | maquininha",
        " maquininha",
        " - pix",
        " pix"
      ];
      
      for (const suffix of suffixes) {
        if (desc.toLowerCase().endsWith(suffix.toLowerCase())) {
          const patternKey = `*${suffix.toLowerCase()}`;
          if (!suffixPatterns[patternKey]) {
            suffixPatterns[patternKey] = [];
          }
          suffixPatterns[patternKey].push(tx.id);
          break; // Encontramos um sufixo, não precisamos verificar os outros
        }
      }
    });
    
    // 2. Verificar se há padrões de prefixo (começando com X)
    const prefixPatterns = {};
    transactions.forEach(tx => {
      const desc = tx.description?.trim();
      if (!desc) return;
      
      // Verificar por prefixos comuns
      const prefixes = [
        "pix ",
        "transferência ",
        "pagamento ",
        "recebimento "
      ];
      
      for (const prefix of prefixes) {
        if (desc.toLowerCase().startsWith(prefix.toLowerCase())) {
          const patternKey = `${prefix.toLowerCase()}*`;
          if (!prefixPatterns[patternKey]) {
            prefixPatterns[patternKey] = [];
          }
          prefixPatterns[patternKey].push(tx.id);
          break; // Encontramos um prefixo, não precisamos verificar os outros
        }
      }
    });
    
    // 3. Verificar palavras-chave que aparecem em qualquer lugar da descrição
    const keywordPatterns = {};
    transactions.forEach(tx => {
      const desc = tx.description?.trim().toLowerCase();
      if (!desc) return;
      
      // Verificar por palavras-chave comuns
      const keywords = [
        "transferencia",
        "pagamento",
        "deposito",
        "cheque",
        "recebimento"
      ];
      
      for (const keyword of keywords) {
        if (desc.includes(keyword.toLowerCase())) {
          const patternKey = `*${keyword.toLowerCase()}*`;
          if (!keywordPatterns[patternKey]) {
            keywordPatterns[patternKey] = [];
          }
          keywordPatterns[patternKey].push(tx.id);
          break; // Encontramos uma palavra-chave, não precisamos verificar as outras
        }
      }
    });
    
    // 4. Priorizar padrões: primeiro sufixos, depois prefixos, depois palavras-chave
    // Só usamos um tipo de padrão se ele cobrir todas as transações selecionadas
    const transactionCount = transactions.length;
    
    // Verificar padrões de sufixo primeiro
    for (const [pattern, txIds] of Object.entries(suffixPatterns)) {
      if (txIds.length === transactionCount) {
        patterns[pattern] = txIds;
        return patterns; // Encontramos um padrão que cobre todas as transações
      }
    }
    
    // Se não encontramos sufixos completos, verificar prefixos
    for (const [pattern, txIds] of Object.entries(prefixPatterns)) {
      if (txIds.length === transactionCount) {
        patterns[pattern] = txIds;
        return patterns;
      }
    }
    
    // Se não encontramos prefixos completos, verificar palavras-chave
    for (const [pattern, txIds] of Object.entries(keywordPatterns)) {
      if (txIds.length === transactionCount) {
        patterns[pattern] = txIds;
        return patterns;
      }
    }
    
    // 5. Se não conseguimos um padrão que cubra todas as transações,
    // tentamos agrupar transações com padrões semelhantes
    
    // Primeiro, tentamos os sufixos mais comuns
    let bestSuffixPattern = "";
    let bestSuffixCount = 0;
    for (const [pattern, txIds] of Object.entries(suffixPatterns)) {
      if (txIds.length > bestSuffixCount) {
        bestSuffixPattern = pattern;
        bestSuffixCount = txIds.length;
      }
    }
    
    if (bestSuffixCount > 1) {
      patterns[bestSuffixPattern] = suffixPatterns[bestSuffixPattern];
    }
    
    return patterns;
  };

  // Aplicar categoria às transações selecionadas
  const handleApplyCategory = async () => {
    if (!selectedCategory) {
      alert("Por favor, selecione uma categoria para aplicar.");
      return;
    }
    
    const selectedIds = Object.keys(selectedTransactions).filter(id => selectedTransactions[id]);
    if (selectedIds.length === 0) {
      alert("Por favor, selecione pelo menos uma transação.");
      return;
    }
    
    const [groupName, categoryName] = selectedCategory.split('.');
    
    setSaving(true);
    try {
      const currentUser = auth.currentUser;
      
      // 1. Buscar as transações selecionadas
      const selectedTransactionsData = uncategorizedTransactions.filter(tx => selectedIds.includes(tx.id));
      const fileTransactions = {}; // Organizar transações por arquivo para atualização
      
      // 2. Detectar padrões nas transações selecionadas
      const patterns = detectPatterns(selectedTransactionsData);
      
      // 3. Atualizar/criar mapeamentos de categorias
      const newMappings = { ...categoryMappings };
      
      // Primeiro, tentar usar os padrões identificados
      if (Object.keys(patterns).length > 0) {
        // Adicionar padrões ao mapeamento
        for (const [pattern, txIds] of Object.entries(patterns)) {
          // Criar um padrão de mapeamento no formato: *PADRÃO para sufixos ou PADRÃO* para prefixos
          const mappingKey = pattern.startsWith("*") || pattern.endsWith("*") 
            ? pattern 
            : `*${pattern}*`;  // Por padrão, usamos o padrão como substring
          
          newMappings[mappingKey] = {
            categoryName: categoryName,
            categoryPath: selectedCategory,
            groupName: groupName,
            lastUsed: new Date(),
            isPattern: true // Indicar que é um padrão, não um match exato
          };
          
          // Agrupar estas transações por fileId
          txIds.forEach(txId => {
            const tx = selectedTransactionsData.find(t => t.id === txId);
            if (tx?.fileId) {
              if (!fileTransactions[tx.fileId]) {
                fileTransactions[tx.fileId] = [];
              }
              fileTransactions[tx.fileId].push(tx.id);
            }
          });
        }
      } else {
        // Se não foi possível detectar padrões, recorrer à abordagem de descrição exata
        selectedTransactionsData.forEach(tx => {
          // Adicionar ao mapeamento
          const normalizedDescription = tx.description?.trim().toLowerCase();
          if (normalizedDescription) {
            newMappings[normalizedDescription] = {
              categoryName: categoryName,
              categoryPath: selectedCategory,
              groupName: groupName,
              lastUsed: new Date()
            };
          }
          
          // Agrupar por fileId para atualização
          if (tx.fileId) {
            if (!fileTransactions[tx.fileId]) {
              fileTransactions[tx.fileId] = [];
            }
            fileTransactions[tx.fileId].push(tx.id);
          }
        });
      }
      
      // 4. Salvar mapeamentos de categorias no Firestore
      await setDoc(doc(db, "categoryMappings", currentUser.uid), {
        userId: currentUser.uid,
        mappings: newMappings,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // 5. Atualizar documentos de arquivos OFX para marcar transações categorizadas
      for (const [fileId, transactionIds] of Object.entries(fileTransactions)) {
        await updateDoc(doc(db, "ofxFiles", fileId), {
          categorizedTransactions: arrayUnion(...transactionIds),
          lastUpdated: serverTimestamp()
        });
      }
      
      // 6. Atualizar estado local
      setCategoryMappings(newMappings);
      
      // 7. Remover transações categorizadas da lista
      const newUncategorized = uncategorizedTransactions.filter(tx => !selectedIds.includes(tx.id));
      setUncategorizedTransactions(newUncategorized);
      
      // 8. Resetar seleções e atualizar progresso
      setSelectedTransactions({});
      setSelectedCategory('');
      setProgress(prev => ({
        total: prev.total,
        completed: prev.completed + selectedIds.length
      }));
      
      // 9. Atualizar padrões similares
      findSimilarPatterns(newUncategorized);
      
      // 10. Recarregar o dashboard
      if (refreshDashboard) {
        refreshDashboard();
      }
    } catch (error) {
      console.error("Erro ao salvar categorias:", error);
      alert("Ocorreu um erro ao salvar as categorias. Por favor, tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  // Aplicar categoria com base em padrão
  const handleApplyCategoryToPattern = (pattern) => {
    if (!selectedCategory) {
      alert("Por favor, selecione uma categoria para aplicar.");
      return;
    }
    
    const patternData = similarPatterns.find(p => p.pattern === pattern);
    if (!patternData) return;
    
    const newSelection = { ...selectedTransactions };
    patternData.transactions.forEach(txId => {
      newSelection[txId] = true;
    });
    
    setSelectedTransactions(newSelection);
  };

  // Aplicar categoria sugerida
  const handleApplySuggestion = (txId, category) => {
    setSelectedCategory(category);
    setSelectedTransactions({ [txId]: true });
  };

  // Obter itens da página atual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  };

  // Calcular total de páginas
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Renderizar paginação
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    
    // Primeira página
    pages.push(
      <button 
        key="first" 
        style={currentPage === 1 ? style.paginationButtonActive : style.paginationButton}
        onClick={() => setCurrentPage(1)}
      >
        1
      </button>
    );
    
    // Páginas intermediárias
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    
    if (startPage > 2) {
      pages.push(<span key="ellipsis1" style={style.paginationEllipsis}>...</span>);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      if (i === 1 || i === totalPages) continue; // Já renderizados separadamente
      
      pages.push(
        <button 
          key={i} 
          style={currentPage === i ? style.paginationButtonActive : style.paginationButton}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }
    
    if (endPage < totalPages - 1) {
      pages.push(<span key="ellipsis2" style={style.paginationEllipsis}>...</span>);
    }
    
    // Última página
    if (totalPages > 1) {
      pages.push(
        <button 
          key="last" 
          style={currentPage === totalPages ? style.paginationButtonActive : style.paginationButton}
          onClick={() => setCurrentPage(totalPages)}
        >
          {totalPages}
        </button>
      );
    }
    
    return (
      <div style={style.paginationContainer}>
        <button 
          style={style.paginationButton}
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          &lt;
        </button>
        {pages}
        <button 
          style={style.paginationButton}
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          &gt;
        </button>
      </div>
    );
  };

  // Calcular o progresso geral de categorização
  const categorizedPercentage = progress.total > 0 
    ? Math.round((progress.completed / progress.total) * 100) 
    : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '50px 0' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '3px solid #e0e0e0',
          borderTopColor: '#4285f4',
          animation: 'spin 1s linear infinite'
        }}></div>
        <span style={{ marginLeft: '15px', color: '#666' }}>Carregando transações...</span>
      </div>
    );
  }

  const dropdownCategories = formatCategoriesForDropdown();
  const currentItems = getCurrentPageItems();
  const selectedCount = Object.values(selectedTransactions).filter(Boolean).length;

  return (
    <div style={style.container}>
      {/* Overlay de carregamento durante salvamento */}
      {saving && (
        <div style={style.loadingOverlay}>
          <div>
            <div style={style.loadingSpinner}></div>
            <p style={{ textAlign: 'center', marginTop: '10px' }}>Salvando categorias...</p>
          </div>
        </div>
      )}
      
      <div style={style.header}>
        <h2 style={style.headerTitle}>Categorizar Transações</h2>
      </div>

      {/* Informações sobre o novo sistema */}
      <div style={style.infoCard}>
        <h3 style={style.infoTitle}>
          Sobre a categorização
        </h3>
        <p style={style.infoText}>
          Agora utilizamos um sistema mais eficiente: em vez de salvar cada transação individualmente, 
          salvamos apenas os mapeamentos entre descrições e categorias. Isso permite categorizar automaticamente 
          transações semelhantes no futuro.
        </p>
        <p style={style.infoText}>
          Quando você categoriza uma transação, todas as futuras transações com a mesma descrição 
          serão automaticamente associadas à mesma categoria.
        </p>
      </div>

      {/* Status e progresso */}
      <div style={style.statsContainer}>
        <div style={style.statCard}>
          <div style={style.statValue}>{uncategorizedTransactions.length}</div>
          <div style={style.statLabel}>Transações não categorizadas</div>
        </div>
        <div style={style.statCard}>
          <div style={style.statValue}>
            {formatCurrency(uncategorizedTransactions.reduce((sum, tx) => sum + tx.amount, 0))}
          </div>
          <div style={style.statLabel}>Valor total</div>
        </div>
        <div style={style.statCard}>
          <div style={style.statValue}>{categorizedPercentage}%</div>
          <div style={style.statLabel}>Progresso</div>
        </div>
      </div>

      {/* Barra de progresso */}
      <div style={style.progressContainer}>
        <div 
          style={{
            ...style.progressBar,
            width: `${categorizedPercentage}%`
          }}
        ></div>
      </div>
      <div style={style.progressText}>
        {progress.completed} de {progress.total} transações categorizadas
      </div>

      {/* Seletor de categoria */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
          Selecione uma categoria:
        </label>
        <select 
          style={style.categorySelector}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Selecione uma categoria</option>
          {dropdownCategories.map((group, index) => (
            <optgroup key={index} label={group.group}>
              {group.options.map((option, idx) => (
                <option key={idx} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Categorização rápida com base em padrões */}
      {similarPatterns.length > 0 && (
        <div style={style.quickCategorizeCard}>
          <h3 style={style.quickCategorizeTitle}>Categorização Rápida por Padrões</h3>
          <div style={style.patternContainer}>
            {similarPatterns.map((pattern, index) => (
              <div key={index} style={style.patternItem}>
                <div style={style.patternCount}>{pattern.count}</div>
                <span>{pattern.pattern}</span>
                <button 
                  style={style.applyButton}
                  onClick={() => handleApplyCategoryToPattern(pattern.pattern)}
                >
                  Selecionar
                </button>
              </div>
            ))}
          </div>
          <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
            Selecione um padrão comum nas descrições para categorizar múltiplas transações de uma vez.
          </p>
        </div>
      )}

      {/* Filtros */}
      <div style={style.filtersContainer}>
        <input
          type="text"
          placeholder="Buscar na descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={style.searchInput}
        />
        
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={style.dropdown}
        >
          <option value="date">Ordenar por: Data (mais recente)</option>
          <option value="amount_desc">Ordenar por: Valor (maior)</option>
          <option value="amount_asc">Ordenar por: Valor (menor)</option>
          <option value="description">Ordenar por: Descrição</option>
        </select>
      </div>

      {/* Ações em lote */}
      <div style={style.bulkActionsContainer}>
        <button 
          style={{
            ...style.bulkActionButton,
            backgroundColor: '#fff',
            color: '#4285f4',
            border: '1px solid #4285f4',
            marginRight: '8px'
          }}
          onClick={handleSelectAllInPage}
        >
          Selecionar todos na página
        </button>
        
        <button 
          style={{
            ...style.bulkActionButton,
            backgroundColor: '#fff',
            color: '#f44336',
            border: '1px solid #f44336',
            marginRight: '8px'
          }}
          onClick={handleDeselectAll}
          disabled={selectedCount === 0}
        >
          Limpar seleção ({selectedCount})
        </button>
        
        <button 
          style={style.bulkActionButton}
          onClick={handleApplyCategory}
          disabled={selectedCount === 0 || !selectedCategory}
        >
          Aplicar categoria a {selectedCount} itens
        </button>
      </div>

      {/* Lista de transações */}
      {filteredTransactions.length === 0 ? (
        <div style={style.noTransactions}>
          {searchTerm 
            ? "Nenhuma transação encontrada para esta busca." 
            : "Todas as transações foram categorizadas!"}
        </div>
      ) : (
        <div style={style.transactionsList}>
          {currentItems.map((transaction, index) => (
            <div 
              key={transaction.id} 
              style={{
                ...style.transactionItem,
                ...(index % 2 === 0 ? {} : style.transactionItemHover),
                ...(selectedTransactions[transaction.id] ? style.transactionItemSelected : {})
              }}
            >
              <input 
                type="checkbox" 
                checked={!!selectedTransactions[transaction.id]} 
                onChange={() => handleToggleSelect(transaction.id)}
                style={style.checkbox}
              />
              
              <div style={style.transactionDate}>
                {formatDate(transaction.date)}
              </div>
              
              <div style={style.transactionDescription}>
                <div>{transaction.description}</div>
                
                {/* Sugestões de categorias */}
                {categorySuggestions[transaction.id] && (
                  <div style={style.suggestionChips}>
                    {categorySuggestions[transaction.id].map((category, idx) => (
                      <div 
                        key={idx} 
                        style={style.suggestionChip}
                        onClick={() => handleApplySuggestion(transaction.id, category)}
                      >
                        {category.split('.')[1]}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div 
                style={{
                  ...style.transactionAmount,
                  ...(transaction.amount >= 0 ? style.positiveAmount : style.negativeAmount)
                }}
              >
                {formatCurrency(transaction.amount)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {renderPagination()}

      {/* Botão de salvar na parte inferior */}
      {selectedCount > 0 && selectedCategory && (
        <div style={style.bottomButtonContainer}>
          <button 
            style={style.saveAllButton}
            onClick={handleApplyCategory}
          >
            Categorizar {selectedCount} transações como "{selectedCategory.split('.')[1]}"
          </button>
        </div>
      )}
    </div>
  );
};

export default DreCategorizationTab;