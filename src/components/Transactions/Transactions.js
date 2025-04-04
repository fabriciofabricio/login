// src/components/Transactions/Transactions.js
import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import FileUpload from "./FileUpload";
import TransactionList from "./TransactionList";
import "./Transactions.css";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [fileId, setFileId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);

  // Load user categories on component mount
  useEffect(() => {
    const loadUserCategories = async () => {
      try {
        setLoading(true);
        
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        
        // Get user categories from Firestore
        const userCategoriesDoc = await getDoc(doc(db, "userCategories", currentUser.uid));
        
        if (userCategoriesDoc.exists()) {
          const categoriesData = userCategoriesDoc.data();
          
          // Process categories into a more usable format for the new TransactionItem component
          if (categoriesData.categories) {
            // Extrair categorias selecionadas organizadas por grupo
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
        console.error("Error loading categories:", error);
        setError("Erro ao carregar categorias. Por favor, recarregue a página.");
      } finally {
        setLoading(false);
      }
    };
    
    loadUserCategories();
  }, []);

  // Handler for when transactions are loaded from an OFX file
  const handleTransactionsLoaded = (loadedTransactions, newFileId) => {
    setTransactions(loadedTransactions);
    setFileId(newFileId);
    setError("");
    setSuccess(`${loadedTransactions.length} transações importadas com sucesso!`);
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccess("");
    }, 5000);
  };

  // Handler for errors during file upload
  const handleUploadError = (errorMessage) => {
    setError(errorMessage);
    setSuccess("");
  };

  // Handler for when transactions are successfully saved
  const handleTransactionsSaved = (count) => {
    setSuccess(`${count} transações foram categorizadas e salvas com sucesso!`);
    
    // Clear transactions from the current view
    setTransactions([]);
    setFileId(null);
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setSuccess("");
    }, 5000);
  };

  return (
    <div className="transactions-page">
      {error && (
        <div className="error-message" style={{ 
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message" style={{ 
          marginBottom: '20px', 
          padding: '12px', 
          backgroundColor: '#e8f5e9', 
          color: '#2e7d32',
          borderRadius: '4px' 
        }}>
          {success}
        </div>
      )}
      
      <FileUpload 
        onTransactionsLoaded={handleTransactionsLoaded}
        onError={handleUploadError}
      />
      
      {loading ? (
        <div className="loading-message" style={{ textAlign: 'center', padding: '20px' }}>
          Carregando suas categorias...
        </div>
      ) : Object.keys(categories).length === 0 ? (
        <div className="no-categories-message" style={{ 
          textAlign: 'center', 
          padding: '20px', 
          backgroundColor: '#fff3e0', 
          color: '#e65100',
          borderRadius: '4px' 
        }}>
          Você não tem categorias configuradas. Por favor, configure suas categorias antes de importar transações.
        </div>
      ) : (
        transactions.length > 0 && fileId && (
          <TransactionList 
            transactions={transactions}
            fileId={fileId}
            categories={categories}
            onComplete={handleTransactionsSaved}
          />
        )
      )}
    </div>
  );
};

export default Transactions;