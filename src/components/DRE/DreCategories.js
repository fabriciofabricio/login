// src/components/DRE/DreCategories.js
import React from "react";

const DreCategories = ({ loading, dreData, financialCategories, navigate }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-10 h-10 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Carregando categorias...</span>
      </div>
    );
  }

  // Cores para as categorias
  const categoryColors = {
    "1. RECEITA": { bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-800", dot: "bg-blue-500" },
    "2. (-) DEDUÇÕES DA RECEITA": { bg: "bg-red-50", border: "border-red-100", text: "text-red-800", dot: "bg-red-500" },
    "4. (+) OUTRAS RECEITAS OPERACIONAIS E NÃO OPERACIONAIS": { bg: "bg-green-50", border: "border-green-100", text: "text-green-800", dot: "bg-green-500" },
    "5. (-) CUSTOS DAS MERCADORIAS VENDIDAS (CMV)": { bg: "bg-yellow-50", border: "border-yellow-100", text: "text-yellow-800", dot: "bg-yellow-500" },
    "7. (-) DESPESAS OPERACIONAIS": { bg: "bg-purple-50", border: "border-purple-100", text: "text-purple-800", dot: "bg-purple-500" },
    "8. (-) DESPESAS COM SÓCIOS": { bg: "bg-indigo-50", border: "border-indigo-100", text: "text-indigo-800", dot: "bg-indigo-500" },
    "9. (-) INVESTIMENTOS": { bg: "bg-indigo-50", border: "border-indigo-100", text: "text-indigo-800", dot: "bg-indigo-500" }
  };

  // Filtrar apenas grupos não calculados
  const categoryGroups = Object.keys(financialCategories)
    .filter(key => !financialCategories[key].isTotal)
    .sort((a, b) => financialCategories[a].order - financialCategories[b].order);

  const handleEditCategories = () => {
    navigate("/select-categories");
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Categorias Financeiras</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Gerenciamento e análise de categorias</p>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categoryGroups.map(groupKey => {
            const group = financialCategories[groupKey];
            const groupData = dreData[groupKey];
            const colors = categoryColors[groupKey] || { 
              bg: "bg-gray-50", 
              border: "border-gray-100", 
              text: "text-gray-800", 
              dot: "bg-gray-500" 
            };
            
            const categories = groupData?.categories 
              ? Object.keys(groupData.categories) 
              : [];
              
            const displayLimit = 5;
            
            return (
              <div key={groupKey} className={`${colors.bg} rounded-lg p-4 border ${colors.border}`}>
                <h4 className={`font-medium ${colors.text} mb-2`}>{group.displayName}</h4>
                <ul className="space-y-2">
                  {categories.slice(0, displayLimit).map((category, index) => (
                    <li key={index} className="flex items-center">
                      <span className={`h-2 w-2 ${colors.dot} rounded-full mr-2`}></span>
                      <span className="text-sm text-gray-700">{category}</span>
                    </li>
                  ))}
                  {categories.length > displayLimit && (
                    <li className="flex items-center">
                      <span className={`h-2 w-2 ${colors.dot} rounded-full mr-2`}></span>
                      <span className="text-sm text-gray-700">
                        +{categories.length - displayLimit} mais...
                      </span>
                    </li>
                  )}
                  {categories.length === 0 && (
                    <li className="text-sm text-gray-500 italic">Nenhuma categoria com transações</li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 text-right">
          <button 
            onClick={handleEditCategories}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Editar Categorias
          </button>
        </div>
      </div>
    </div>
  );
};

export default DreCategories;