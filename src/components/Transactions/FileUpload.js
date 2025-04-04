// src/components/Transactions/FileUpload.js
import React, { useState } from "react";
import { auth, db } from "../../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { parseOFXFile } from "../../utils/OFXParser";
import "./Transactions.css";

const FileUpload = ({ onTransactionsLoaded, onError }) => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.name.endsWith('.ofx') || selectedFile.name.endsWith('.OFX'))) {
      setFile(selectedFile);
    } else {
      setFile(null);
      onError("Por favor, selecione um arquivo OFX válido.");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      onError("Por favor, selecione um arquivo OFX válido.");
      return;
    }

    try {
      setUploading(true);
      setProgress(20);

      // 1. Parse the OFX file to extract transactions
      const transactions = await parseOFXFile(file);
      setProgress(70);

      // 2. Verificar usuário atual
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Usuário não autenticado.");

      // 3. Salvar metadados do arquivo no Firestore com ID do usuário explícito
      const fileRef = await addDoc(collection(db, "ofxFiles"), {
        userId: currentUser.uid,
        fileName: file.name,
        uploadDate: serverTimestamp(),
        transactionCount: transactions.length
      });

      setProgress(100);

      // 4. Passar as transações analisadas para o componente pai
      onTransactionsLoaded(transactions, fileRef.id);

      // Reset the form
      setFile(null);
      document.getElementById('ofx-file-input').value = '';
    } catch (error) {
      console.error("Error processing OFX file:", error);
      onError(`Erro ao processar o arquivo: ${error.message}`);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="file-upload-container">
      <h3>Importar Extrato OFX</h3>
      
      <div className="file-upload-form">
        <input
          type="file"
          id="ofx-file-input"
          accept=".ofx,.OFX"
          onChange={handleFileChange}
          disabled={uploading}
          className="file-input"
        />
        
        <label htmlFor="ofx-file-input" className="file-label">
          {file ? file.name : "Escolher arquivo OFX"}
        </label>
        
        <button 
          onClick={handleUpload} 
          disabled={!file || uploading}
          className="upload-button"
        >
          {uploading ? "Processando..." : "Importar Transações"}
        </button>
      </div>
      
      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text">{progress}% Concluído</div>
        </div>
      )}
      
      <div className="upload-instructions">
        <p>Selecione um arquivo OFX do seu banco para importar suas transações.</p>
        <p>As transações serão analisadas e você poderá categorizá-las de acordo com suas categorias.</p>
      </div>
    </div>
  );
};

export default FileUpload;