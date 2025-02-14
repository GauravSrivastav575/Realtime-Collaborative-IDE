import React, { useRef, useEffect, useState} from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { MonacoBinding } from "y-monaco";
import "./EditorSection.css";

const getRandomColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 50%)`;
};

const EditorSection = ({ code, setCode, activeFile }) => {
  const editorRef = useRef(null);
  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);
  const isInitialContentSet = useRef(false);
  const [activeUsers, setActiveUsers] = useState([]);

  const cleanup = () => {
    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
    }
    if (ydocRef.current) {
      ydocRef.current.destroy();
      ydocRef.current = null;
    }
    isInitialContentSet.current = false;
  };

  useEffect(() => {
    cleanup();
    
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;
    
    const provider = new WebrtcProvider(`collab-${activeFile}`, ydoc, {
      // signaling: ['ws://localhost:4444'] // Local URL for the signaling server
      signaling: ['https://y-webrtc-l6di.onrender.com'] // deployed URL for the signaling server
    });
    
    providerRef.current = provider;
    const ytext = ydoc.getText("monaco");

    const awareness = provider.awareness;
    const username = localStorage.getItem('username');
    awareness.setLocalStateField('user', {
      name: username,
      color: getRandomColor()
    });


    // Handle awareness changes
    const handleAwarenessChange = () => {
      const states = Array.from(awareness.getStates().entries());
      const users = states
        .map(([clientId, state]) => ({
          ...(state.user || {}),
          clientId,
        }))
        .filter(user => user.name);
      setActiveUsers(users);
    };

    awareness.on('change', handleAwarenessChange);

    // Handle initial content
    const handleSync = () => {
      if (!isInitialContentSet.current && ytext.length === 0) {
        // Set initial content only if document is empty
        ytext.insert(0, code || '');
        isInitialContentSet.current = true;
      }
    };

    provider.on('synced', handleSync);

    // Set up editor binding if editor is mounted
    if (editorRef.current) {
      setupBinding(editorRef.current);
    }

    return () => {
      awareness.off('change', handleAwarenessChange);
      provider.off('synced', handleSync);
      cleanup();
    };
  }, [activeFile]);

  const setupBinding = (editor) => {
    if (!ydocRef.current || !providerRef.current) return;

    const ytext = ydocRef.current.getText("monaco");
    
    // Create Monaco binding
    const binding = new MonacoBinding(
      ytext,
      editor.getModel(),
      new Set([editor]),
      providerRef.current.awareness
    );
    bindingRef.current = binding;

    ytext.observe(() => {
      // console.log("Yjs document updated:", ytext.toString());
      setCode(ytext.toString()); // Update editor when Yjs changes
    });
    // Clean up the event listener when component unmounts
    return () => {
      disposable.dispose();
    };
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    if (ydocRef.current && providerRef.current) {
      setupBinding(editor);
    }
  };

  return (
    <div className="editor-container">
      <div className="active-users">
        {activeUsers.map(user => (
          <div key={user.clientId} className="user">
            <span 
              className="user-color" 
              style={{ backgroundColor: user.color }}
            />
            <span className="user-name">{user.name}</span>
          </div>
        ))}
      </div>
      <Editor
        height="100%"
        width="100%"
        theme="vs-dark"
        language="cpp"
        value={code}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          automaticLayout: true,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          renderWhitespace: 'none',
          cursorStyle: 'line',
          fixedOverflowWidgets: true,
          // Add these options to help prevent unwanted behavior
          renderFinalNewline: true,
          trimAutoWhitespace: true,
        }}
      />
    </div>
  );
};

export default EditorSection;