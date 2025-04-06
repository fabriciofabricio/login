// src/components/DRE/DreHeader.js
import React from "react";
import { getPeriodLabel } from "../../utils/dateUtils";

const DreHeader = ({
  selectedPeriod,
  setSelectedPeriod,
  periods,
  comparisonMode,
  setComparisonMode,
  compareWithPeriod,
  setCompareWithPeriod
}) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h1>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {periods.map((period) => (
                <option key={period.period} value={period.period}>
                  {period.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="comparison-toggle"
              checked={comparisonMode}
              onChange={() => setComparisonMode(!comparisonMode)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="comparison-toggle" className="ml-2 text-sm text-gray-700">
              Comparar períodos
            </label>
          </div>
          
          {comparisonMode && (
            <div className="relative">
              <select 
                value={compareWithPeriod}
                onChange={(e) => setCompareWithPeriod(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {periods
                  .filter(p => p.period !== selectedPeriod)
                  .map((period) => (
                    <option key={period.period} value={period.period}>
                      Comparar com {period.label}
                    </option>
                  ))
                }
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DreHeader;