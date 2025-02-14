import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EditorSection from "./EditorSection";
import OutputSection from "./OutputSection";
import StdinSection from "./StdinSection";
import RunButton from "./RunButton";
import FileExplorer from "./FileExplorer";
import AccessControl from './AccessControl';
import "./EditorPage.css";

function EditorPage() {
  const [files, setFiles] = useState([]);
  const [output, setOutput] = useState("");
  const [code, setCode] = useState("");
  const [stdin, setStdin] = useState("");
  const [activeFile, setActiveFile] = useState(null);
  const [currentCreator, setCurrentCreator] = useState(null);
  const userId = localStorage.getItem('userId');
  const [lastSaved, setLastSaved] = useState(null);
  // Refs to track latest values
  const activeFileRef = useRef(activeFile);
  const codeRef = useRef(code);
  const isSavingRef = useRef(false);

  // console.log('Current Creator:', currentCreator);
  // console.log('User ID:', userId);
  // console.log('Active File:', activeFile);

  useEffect(() => {
    activeFileRef.current = activeFile;
    codeRef.current = code;
  }, [activeFile, code]);

  const saveCurrentFile = async () => {
    console.log("save function hitted");
    console.log(isSavingRef.current);
    if (localStorage.getItem('isDeletingFile') === 'true'){
      console.log("Skipping save - file is being deleted");
      return;
    }
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    
    const currentFile = activeFileRef.current;
    const currentCode = codeRef.current;
    console.log("currentFile", currentFile);
    console.log("currentCode", currentCode);
    if (!currentFile || !currentCode) {
      isSavingRef.current = false;
      return;
    }

    try {
      console.log("sending code through fetch api");
      const token = localStorage.getItem('token');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      // Try normal fetch first
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/files/${currentFile}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ codeBase: currentCode }),
        signal: controller.signal,
        keepalive: true
      });
      
      setLastSaved(new Date());
      clearTimeout(timeoutId);
    } catch (error) {
      console.error('Primary save failed, trying beacon:', error);
    } finally {
      isSavingRef.current = false;
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      saveCurrentFile();
      if (!isSavingRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Handle in-app navigation
  useEffect(() => {
    return () => {
      if (!isSavingRef.current) {
        saveCurrentFile();
      }
    };
  }, []);

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (activeFileRef.current && codeRef.current) {
        saveCurrentFile();
      }
    }, 20000);

    return () => clearInterval(autoSaveInterval);
  }, []);

  const handleRunCode = async () => {
    setOutput("Compiling...");

    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          language: "cpp",
          version: "10.2.0",
          files: [
            {
              content: code
            }
          ],
          stdin
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setOutput(`Error ${response.status} : ${JSON.stringify(errorData)}`);
        return;
      }

      const data = await response.json();
      setOutput(data.run.output);
    } catch (error) {
      setOutput(`Error : ${error.message}`);
    }
  };

  const handleFileSelect = (fileData) => {
    if (!fileData){
      setCode('');
      setActiveFile(null);
      activeFileRef.current = null;
      setTimeout(() => {
        setCode('');
      }, 100);
      setCurrentCreator(null);
      console.log("fileData is null",activeFileRef.current);
      return;
  }
    saveCurrentFile();
    // Reset the code state first
    setCode('');
    // Then set the new file data
    setActiveFile(fileData.id);
    // Set the code after a small delay to ensure proper initialization
    setTimeout(() => {
      setCode(fileData.content);
    }, 100);
    setCurrentCreator(fileData.createdBy);
  };

  const handleCreateFile = (file) => {
    setFiles(prevFiles => [...prevFiles, file]);
    // Reset the code state first
    setCode('');
    // Then set the new file data
    setActiveFile(file._id);
    // Set the code after a small delay to ensure proper initialization
    setTimeout(() => {
      setCode(file.content);
    }, 100);
    setCurrentCreator(file.createdBy);
  };
  
  const isCreator = currentCreator === userId;
  // console.log(isCreator);
  return (
    <div className="app-container">
      <FileExplorer 
        onFileSelect={handleFileSelect} 
        onCreateFile={handleCreateFile}
      />
      <div className="editor-panel">
        <EditorSection code={code} setCode={setCode} activeFile={activeFile}/>
        <div className="right-panel">
          {lastSaved && (
            <div className="last-saved">
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
          {isCreator && activeFile && (<AccessControl fileId={activeFile} />)}
          <RunButton handleRunCode={handleRunCode} />
          <OutputSection output={output} />
          <StdinSection stdin={stdin} setStdin={setStdin} />
        </div>
      </div>
    </div>
  );
}

export default EditorPage;