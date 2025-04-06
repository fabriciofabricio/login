// src/components/DRE/DreDashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DreHeader from "./DreHeader";
import DreOverview from "./DreOverview";
import DreDetails from "./DreDetails";
import DreTrends from "./DreTrends";
import DreCategories from "./DreCategories";
import { formatCurrency } from "../../utils/formatUtils";
import { getCurrentPeriod, getPeriodLabel, getRecentPeriods } from "../../utils/dateUtils";
import { 
  fetchTransactionsForPeriod, 
  processDreData, 
  fetchUncategorizedTransactions,
  fetchMonthlyTrendsData,
  comparePeriods
} from "../../utils/dreDataProcessor";
import "./DRE.css";

const DreDashboard = ({ user, financialCategories }) => {
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState(getCurrentPeriod);
  const [periods, setPeriods] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [dreData, setDreData] = useState({});
  const [monthlyData, setMonthlyData] = useState([]);
  const [uncategorizedData, setUncategorizedData] = useState({ count: 0, amount: 0 });
  const [showUncategorized, setShowUncategorized] = useState(true);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [compareWithPeriod, setCompareWithPeriod] = useState("");
  const [comparisonData, setComparisonData] = useState({});
  const [variations, setVariations] = useState({});
  const navigate = useNavigate();

  // Carregar períodos disponíveis
  useEffect(() => {
    const loadPeriods = async () => {
      try {
        // Carregar períodos recentes (últimos 12 meses)
        const periodsArray = getRecentPeriods(12);
        setPeriods(periodsArray);
        
        // Definir o período mais recente como padrão
        if (periodsArray.length > 0 && !selectedPeriod) {
          setSelectedPeriod(periodsArray[0].period);
        }
        
        // Definir o segundo período mais recente para comparação
        if (periodsArray.length > 1) {
          setCompareWithPeriod(periodsArray[1].period);
        }
      } catch (error) {
        console.error("Erro ao carregar períodos:", error);
      }
    };

    loadPeriods();
  }, [selectedPeriod]);

  // Carregar transações e dados para o DRE
  useEffect(() => {
    if (!selectedPeriod || !user) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Buscar transações do período selecionado
        const transactionsData = await fetchTransactionsForPeriod(user.uid, selectedPeriod);
        setTransactions(transactionsData);
        
        // 2. Processar dados para o formato DRE
        const processedData = processDreData(transactionsData, financialCategories);
        setDreData(processedData);
        
        // 3. Buscar informações sobre transações não categorizadas
        const uncategorized = await fetchUncategorizedTransactions(user.uid, selectedPeriod);
        setUncategorizedData(uncategorized);
        
        // 4. Buscar dados para tendências mensais
        const monthlyTrendsData = await fetchMonthlyTrendsData(user.uid, 6);
        setMonthlyData(monthlyTrendsData);
        
        // 5. Se o modo de comparação estiver ativado, buscar dados do período de comparação
        if (comparisonMode && compareWithPeriod) {
          const comparisonTransactions = await fetchTransactionsForPeriod(user.uid, compareWithPeriod);
          const comparisonProcessedData = processDreData(comparisonTransactions, financialCategories);
          setComparisonData(comparisonProcessedData);
          
          // Calcular variações entre períodos
          const periodsVariations = comparePeriods(processedData, comparisonProcessedData);
          setVariations(periodsVariations);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    loadData();
  }, [selectedPeriod, user, financialCategories, comparisonMode, compareWithPeriod]);

  // Função para lidar com transações não categorizadas
  const handleCategorizeClick = () => {
    navigate("/transactions");
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Carregando dados financeiros...</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <DreHeader 
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        periods={periods}
        comparisonMode={comparisonMode}
        setComparisonMode={setComparisonMode}
        compareWithPeriod={compareWithPeriod}
        setCompareWithPeriod={setCompareWithPeriod}
      />

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`${
                activeTab === "details"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Detalhamento
            </button>
            <button
              onClick={() => setActiveTab("trends")}
              className={`${
                activeTab === "trends"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Tendências
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`${
                activeTab === "categories"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Categorias
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Alert for uncategorized transactions */}
        {uncategorizedData.count > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <span className="font-medium">Atenção:</span> Existem {uncategorizedData.count} transações não categorizadas 
                  {uncategorizedData.amount !== 0 && ` no valor de ${formatCurrency(uncategorizedData.amount)}`}
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  {showUncategorized ? 
                    "Os valores não categorizados estão incluídos no cálculo, mas podem afetar a precisão do seu DRE." :
                    "Os valores não categorizados não estão incluídos no cálculo atual."}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button 
                    onClick={handleCategorizeClick}
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs font-medium px-3 py-1 rounded-md"
                  >
                    Categorizar Transações
                  </button>
                  <button 
                    onClick={() => setShowUncategorized(!showUncategorized)}
                    className="text-yellow-700 hover:text-yellow-600 text-xs font-medium"
                  >
                    {showUncategorized ? "Ocultar do cálculo" : "Incluir no cálculo"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === "overview" && (
          <DreOverview 
            loading={loading}
            dreData={dreData}
            monthlyData={monthlyData}
            selectedPeriod={selectedPeriod}
            comparisonMode={comparisonMode}
            variations={variations}
          />
        )}

        {activeTab === "details" && (
          <DreDetails 
            loading={loading}
            dreData={dreData}
            financialCategories={financialCategories}
            selectedPeriod={selectedPeriod}
            periodLabel={getPeriodLabel(selectedPeriod)}
            comparisonMode={comparisonMode}
            comparisonData={comparisonData}
            compareWithPeriod={compareWithPeriod}
          />
        )}

        {activeTab === "trends" && (
          <DreTrends 
            loading={loading}
            monthlyData={monthlyData}
          />
        )}

        {activeTab === "categories" && (
          <DreCategories 
            loading={loading}
            dreData={dreData}
            financialCategories={financialCategories}
            navigate={navigate}
          />
        )}
      </main>
    </div>
  );
};

export default DreDashboard;