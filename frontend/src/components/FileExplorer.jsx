import React, { useState, useEffect } from 'react';
import { FaRegEdit, FaRegTrashAlt, FaUserLock, FaPlus, FaFile, FaEllipsisV } from 'react-icons/fa';
import './FileExplorer.css';

const FileExplorer = ({ onFileSelect, onCreateFile }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpenFileId, setMenuOpenFileId] = useState(null);
  const [isDeletingFile, setIsDeletingFile] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('User ID not found - please log in again');
        }
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${userId}/files`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch files');
        
        const data = await response.json();
        const formattedFiles = data.map(file => ({
          _id: file.fileId,
          name: file.name
        }));
      
        setFiles(formattedFiles);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching files:', error);
        setLoading(false);
        alert(error.message || 'Failed to fetch files');
      }
    };

    fetchFiles();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.options-menu') && !e.target.closest('.file-options-btn')) {
        setMenuOpenFileId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleFileClick = async (file) => {
    setSelectedFile(file._id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/files/${file._id}/code`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch file content');
      
      const data = await response.json();
      onFileSelect({
        id: file._id, 
        content: data.codeBase,
        createdBy: data.createdBy,
      });
    } catch (error) {
      console.error('Error fetching file content:', error);
      alert(error.message || 'Failed to load file content');
    }
  };

  const handleNewFile = async () => {
    const fileName = prompt('Enter new file name:');
    if (fileName) {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('User ID not found - please log in again');
        }
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/files/new`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            userId: userId,
            fileName: fileName,
            codeBase: '' 
          })
        });
        const responseData = await response.json();
        if (!response.ok) throw new Error('Failed to create file');
        const newFile = {
          _id: responseData.file.fileId,
          name: responseData.file.fileName,
          content: responseData.file.codeBase,
          createdAt: responseData.file.createdAt,
          createdBy: responseData.file.createdBy
        };
        setFiles(prevFiles => [...prevFiles, newFile]);
        onCreateFile(newFile);
        setSelectedFile(newFile._id);
      } catch (error) {
        console.error('Error creating file:', error);
        alert(error.message || 'Failed to create file');
      }
    }
  };

  const handleOptionsClick = (e, fileId) => {
    e.stopPropagation();
    setMenuOpenFileId(menuOpenFileId === fileId ? null : fileId);
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    setIsDeletingFile(true); // Start delete operation
    localStorage.setItem('isDeletingFile', 'true');
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/files/${fileId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to delete file');
        setFiles(prev => prev.filter(file => file && file._id !== fileId));
        if (selectedFile === fileId) {
                setSelectedFile(null);
                onFileSelect(null); // Mark deletion as complete after resetting selection
        }
        setIsDeletingFile(false);
        localStorage.removeItem('isDeletingFile');
    } catch (error) {
        console.error('Error deleting file:', error);
        alert(error.message || 'Failed to delete file');
        setIsDeletingFile(false);
        localStorage.removeItem('isDeletingFile');
    }
  };

  const handleRename = async (fileId) => {
    const newName = prompt('Enter new name:');
    if (!newName) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/files/${fileId}/rename`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newName })
      });

      if (!response.ok) throw new Error('Failed to rename file');
      
      setFiles(prev => prev.map(file => 
        file._id === fileId ? { ...file, name: newName } : file
      ));
    } catch (error) {
      console.error('Rename error:', error);
      alert(error.message || 'Failed to rename file');
    }
  };

  const handleChangeAccess = async (fileId) => {
    alert('Change access functionality not implemented yet');
  };

  return (
    <div className="file-explorer">
      <div className="file-header">
        <h3>Explorer</h3>
        <button onClick={handleNewFile} className="new-file-btn">
          <FaPlus className="icon-sm" />
        </button>
      </div>
      {loading ? (
        <div className="loading">Loading files...</div>
      ) : (
        <ul className="file-list">
          {files.map((file) => (
            <li
              key={file._id}
              className={`file-item ${selectedFile === file._id ? 'selected' : ''}`}
              onClick={() => handleFileClick(file)}
            >
              <div className="file-item-content">
                <div className="file-info">
                  <FaFile className="file-icon" />
                  <span className="file-name">{file.name}</span>
                </div>
                <button 
                  className="file-options-btn"
                  onClick={(e) => handleOptionsClick(e, file._id)}
                >
                  <FaEllipsisV className="icon-xs" />
                </button>
              </div>

              {menuOpenFileId === file._id && (
                <div className="options-menu">
                  <button onClick={() => handleRename(file._id)}>
                    <FaRegEdit className="icon-menu" />
                    <span>Rename</span>
                  </button>
                  <button onClick={() => handleChangeAccess(file._id)}>
                    <FaUserLock className="icon-menu" />
                    <span>Change Access</span>
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(file._id)}
                  >
                    <FaRegTrashAlt className="icon-menu" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileExplorer;