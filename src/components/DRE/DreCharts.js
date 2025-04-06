// src/components/DRE/DreCharts.js
import React from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "../../utils/formatUtils";

// Cores para gráficos
const COLORS = {
  revenue: "#3B82F6", // Azul
  expenses: "#EF4444", // Vermelho
  profit: "#10B981", // Verde
  neutral: "#6B7280", // Cinza
  // Array de cores para categorias
  categories: ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#14B8A6", "#6366F1"]
};

export const LineChartComponent = ({ data, dataKeys, labels, height = 300 }) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Legend />
          {dataKeys.map((key, index) => (
            <Line 
              key={key}
              type="monotone" 
              dataKey={key} 
              name={labels[index]} 
              stroke={COLORS[key] || COLORS.categories[index % COLORS.categories.length]} 
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const BarChartComponent = ({ 
  data, 
  dataKey = "value", 
  nameKey = "name", 
  color = COLORS.revenue, 
  layout = "vertical", 
  height = 300 
}) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout={layout}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          {layout === "vertical" ? (
            <>
              <XAxis type="number" domain={[0, 'dataMax']} tickFormatter={(value) => `R$ ${value/1000}k`} />
              <YAxis type="category" dataKey={nameKey} />
            </>
          ) : (
            <>
              <XAxis dataKey={nameKey} />
              <YAxis domain={[0, 'dataMax']} tickFormatter={(value) => `R$ ${value/1000}k`} />
            </>
          )}
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Bar 
            dataKey={dataKey} 
            name={layout === "vertical" ? "Valor" : null} 
            fill={color} 
            radius={layout === "vertical" ? [0, 4, 4, 0] : [4, 4, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PieChartComponent = ({ data, dataKey = "value", nameKey = "name", height = 300 }) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS.categories[index % COLORS.categories.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};