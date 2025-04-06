// src/components/DRE/DreDetails.js
import React from "react";
import { formatCurrency } from "../../utils/formatUtils";
import { getPeriodLabel } from "../../utils/dateUtils";

const DreDetails = ({ 
  loading, 
  dreData, 
  financialCategories,
  selectedPeriod,
  periodLabel,
  comparisonMode,
  comparisonData,
  compareWithPeriod
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-10 h-10 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Carregando dados detalhados...</span>
      </div>
    );
  }

  const isPositive = (value) => value >= 0;

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    alert("Funcionalidade de exportação será implementada em breve.");
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-lg leading-6 font-medium text-gray-900">Demonstração de Resultado</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Período: {periodLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handlePrint}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
            </svg>
            Imprimir
          </button>
          <button 
            onClick={handleExport}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="mr-2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Exportar
          </button>
        </div>
      </div>
      
      <div className="border-t border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {comparisonMode ? getPeriodLabel(selectedPeriod) : "Valor"}
              </th>
              {comparisonMode && (
                <>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {getPeriodLabel(compareWithPeriod)}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variação
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.keys(financialCategories)
              .sort((a, b) => financialCategories[a].order - financialCategories[b].order)
              .map((groupKey) => {
                const group = financialCategories[groupKey];
                const groupData = dreData[groupKey];
                const comparisonGroupData = comparisonMode ? comparisonData[groupKey] : null;
                
                if (!groupData && !group.isTotal) return null;
                
                // Calcular variação
                let variation = 0;
                let variationClass = '';
                
                if (comparisonMode && comparisonGroupData) {
                  const currentValue = groupData?.total || 0;
                  const previousValue = comparisonGroupData?.total || 0;
                  
                  if (previousValue !== 0) {
                    variation = (currentValue - previousValue) / Math.abs(previousValue);
                  }
                  
                  // Determinar classe de estilo baseada na variação e no tipo de categoria
                  if (group.isRevenue || groupKey.includes("LUCRO")) {
                    variationClass = variation >= 0 ? 'text-green-600' : 'text-red-600';
                  } else {
                    variationClass = variation >= 0 ? 'text-red-600' : 'text-green-600';
                  }
                }
                
                return (
                  <React.Fragment key={groupKey}>
                    {/* Linha do grupo */}
                    <tr className={`${group.isTotal ? 'bg-gray-100' : (group.isRevenue ? 'bg-blue-50' : 'bg-red-50')}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {group.displayName}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                        group.isRevenue || groupKey.includes("LUCRO") 
                          ? (isPositive(groupData?.total) ? 'text-green-600' : 'text-red-600')
                          : 'text-red-600'
                      }`}>
                        {formatCurrency(groupData?.total || 0)}
                      </td>
                      {comparisonMode && (
                        <>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                            group.isRevenue || groupKey.includes("LUCRO") 
                              ? (isPositive(comparisonGroupData?.total) ? 'text-green-600' : 'text-red-600')
                              : 'text-red-600'
                          }`}>
                            {formatCurrency(comparisonGroupData?.total || 0)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${variationClass}`}>
                            {variation !== 0 && (variation > 0 ? '+' : '')}{(variation * 100).toFixed(1)}%
                          </td>
                        </>
                      )}
                    </tr>
                    
                    {/* Categorias dentro do grupo (apenas para grupos não calculados) */}
                    {!group.isTotal && groupData && Object.keys(groupData.categories || {}).length > 0 && 
                      Object.entries(groupData.categories)
                        .sort(([, valueA], [, valueB]) => Math.abs(valueB) - Math.abs(valueA))
                        .map(([category, value]) => {
                          // Buscar valor de comparação para a categoria, se aplicável
                          let comparisonValue = 0;
                          let categoryVariation = 0;
                          let categoryVariationClass = '';
                          
                          if (comparisonMode && comparisonGroupData && comparisonGroupData.categories) {
                            comparisonValue = comparisonGroupData.categories[category] || 0;
                            
                            if (comparisonValue !== 0) {
                              categoryVariation = (value - comparisonValue) / Math.abs(comparisonValue);
                            }
                            
                            // Determinar classe de estilo para variação da categoria
                            if (group.isRevenue) {
                              categoryVariationClass = categoryVariation >= 0 ? 'text-green-600' : 'text-red-600';
                            } else {
                              categoryVariationClass = categoryVariation >= 0 ? 'text-red-600' : 'text-green-600';
                            }
                          }
                          
                          return (
                            <tr key={`${groupKey}-${category}`}>
                              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 pl-10">• {category}</td>
                              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                                {formatCurrency(value)}
                              </td>
                              {comparisonMode && (
                                <>
                                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                                    {formatCurrency(comparisonValue)}
                                  </td>
                                  <td className={`px-6 py-3 whitespace-nowrap text-sm text-right ${categoryVariationClass}`}>
                                    {categoryVariation !== 0 && (categoryVariation > 0 ? '+' : '')}
                                    {(categoryVariation * 100).toFixed(1)}%
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        })
                    }
                  </React.Fragment>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DreDetails;