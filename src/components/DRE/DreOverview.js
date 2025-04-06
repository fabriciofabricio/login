// src/components/DRE/DreOverview.js
import React from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency, formatPercentage, isPositive } from "../../utils/formatUtils";
import { getPeriodLabel } from "../../utils/dateUtils";

const DreOverview = ({ 
  loading, 
  dreData, 
  monthlyData, 
  selectedPeriod,
  comparisonMode,
  variations
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-10 h-10 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Carregando dados...</span>
      </div>
    );
  }

  // Preparar dados para gráfico de receitas por categoria
  const revenueByCategory = dreData["1. RECEITA"]?.categories
    ? Object.entries(dreData["1. RECEITA"].categories).map(([name, value]) => ({
        name,
        value
      }))
    : [];

  // Preparar dados para gráfico de despesas por categoria
  const expenseCategories = [
    { name: 'CMV', value: dreData['5. (-) CUSTOS DAS MERCADORIAS VENDIDAS (CMV)']?.total || 0 },
    { name: 'Despesas Operacionais', value: dreData['7. (-) DESPESAS OPERACIONAIS']?.total || 0 },
    { name: 'Despesas com Sócios', value: dreData['8. (-) DESPESAS COM SÓCIOS']?.total || 0 },
    { name: 'Investimentos', value: dreData['9. (-) INVESTIMENTOS']?.total || 0 }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Receita Total</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {formatCurrency(dreData['1. RECEITA']?.total || 0)}
              </dd>
              {comparisonMode && variations['1. RECEITA'] && (
                <dd className={`mt-2 text-sm ${isPositive(variations['1. RECEITA'].variation) ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="font-medium">
                    {formatPercentage(variations['1. RECEITA'].variation, true)}
                  </span> desde {getPeriodLabel(selectedPeriod)}
                </dd>
              )}
            </dl>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Despesas Totais</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {formatCurrency((dreData['7. (-) DESPESAS OPERACIONAIS']?.total || 0) + 
                  (dreData['8. (-) DESPESAS COM SÓCIOS']?.total || 0))}
              </dd>
              {comparisonMode && variations['7. (-) DESPESAS OPERACIONAIS'] && (
                <dd className={`mt-2 text-sm ${isPositive(variations['7. (-) DESPESAS OPERACIONAIS'].variation) ? 'text-red-600' : 'text-green-600'}`}>
                  <span className="font-medium">
                    {formatPercentage(variations['7. (-) DESPESAS OPERACIONAIS'].variation, true)}
                  </span> desde {getPeriodLabel(selectedPeriod)}
                </dd>
              )}
            </dl>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Lucro Bruto</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {formatCurrency(dreData['6. (=) LUCRO BRUTO']?.total || 0)}
              </dd>
              {comparisonMode && variations['6. (=) LUCRO BRUTO'] && (
                <dd className={`mt-2 text-sm ${isPositive(variations['6. (=) LUCRO BRUTO'].variation) ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="font-medium">
                    {formatPercentage(variations['6. (=) LUCRO BRUTO'].variation, true)}
                  </span> desde {getPeriodLabel(selectedPeriod)}
                </dd>
              )}
            </dl>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Lucro Líquido</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {formatCurrency(dreData['10. (=) LUCRO LÍQUIDO']?.total || 0)}
              </dd>
              {comparisonMode && variations['10. (=) LUCRO LÍQUIDO'] && (
                <dd className={`mt-2 text-sm ${isPositive(variations['10. (=) LUCRO LÍQUIDO'].variation) ? 'text-green-600' : 'text-red-600'}`}>
                  <span className="font-medium">
                    {formatPercentage(variations['10. (=) LUCRO LÍQUIDO'].variation, true)}
                  </span> desde {getPeriodLabel(selectedPeriod)}
                </dd>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Overview Chart */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Evolução Mensal</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="Receita" stroke="#3B82F6" activeDot={{ r: 8 }} strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" name="Despesas" stroke="#EF4444" strokeWidth={2} />
              <Line type="monotone" dataKey="profit" name="Lucro" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Receitas por Categoria</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueByCategory}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  domain={[0, 'dataMax']} 
                  tickFormatter={(value) => value.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL',
                    maximumFractionDigits: 0
                  })} 
                />
                <YAxis type="category" dataKey="name" />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="value" name="Valor" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Despesas por Categoria</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={expenseCategories}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  domain={[0, 'dataMax']} 
                  tickFormatter={(value) => value.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL',
                    maximumFractionDigits: 0
                  })} 
                />
                <YAxis type="category" dataKey="name" />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="value" name="Valor" fill="#EF4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DreOverview;