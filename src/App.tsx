import { useEffect } from 'react';
import { AppLayout } from './components/Layout/AppLayout';
import { useKeybindings } from './hooks/useKeybindings';
import { useEditorStore } from './stores/editorStore';

function App() {
  useKeybindings();

  const { rootPath, toggleFolder } = useEditorStore();

  // Reload last opened folder on startup
  useEffect(() => {
    if (rootPath) {
      toggleFolder(rootPath);
    }
  }, []);

  return <AppLayout />;
}

export default App;
