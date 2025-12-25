import { useState } from 'react';
import { useEditorStore } from '../../stores/editorStore';
import type { RemoteConnection } from '../../types';

export function RemoteDialog() {
  const {
    remoteDialogVisible,
    toggleRemoteDialog,
    remoteConnections,
    saveRemoteConnection,
    deleteRemoteConnection,
    connectRemote,
    activeRemoteId,
    disconnectRemote,
  } = useEditorStore();

  const [mode, setMode] = useState<'list' | 'add' | 'connect'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  // Form state for new connection
  const [form, setForm] = useState({
    name: '',
    host: '',
    port: '22',
    username: '',
    authType: 'password' as 'password' | 'key',
    keyPath: '',
  });

  if (!remoteDialogVisible) return null;

  const handleSave = () => {
    if (!form.name || !form.host || !form.username) {
      setError('Name, host, and username are required');
      return;
    }

    const connection: RemoteConnection = {
      id: crypto.randomUUID(),
      name: form.name,
      host: form.host,
      port: parseInt(form.port) || 22,
      username: form.username,
      authType: form.authType,
      keyPath: form.authType === 'key' ? form.keyPath : undefined,
    };

    saveRemoteConnection(connection);
    setForm({ name: '', host: '', port: '22', username: '', authType: 'password', keyPath: '' });
    setMode('list');
    setError(null);
  };

  const handleConnect = async () => {
    if (!selectedId) return;

    const connection = remoteConnections.find(c => c.id === selectedId);
    if (!connection) return;

    if (connection.authType === 'password' && !password) {
      setError('Password is required');
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      await connectRemote(selectedId, password);
      setPassword('');
      setMode('list');
      setSelectedId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectRemote();
  };

  const handleDelete = (id: string) => {
    deleteRemoteConnection(id);
    if (selectedId === id) {
      setSelectedId(null);
      setMode('list');
    }
  };

  const startConnect = (id: string) => {
    const connection = remoteConnections.find(c => c.id === id);
    if (!connection) return;

    setSelectedId(id);
    setPassword('');
    setError(null);

    if (connection.authType === 'key') {
      // For key auth, try to connect immediately
      handleConnectWithKey(id);
    } else {
      setMode('connect');
    }
  };

  const handleConnectWithKey = async (id: string) => {
    setConnecting(true);
    setError(null);
    try {
      await connectRemote(id);
      setMode('list');
      setSelectedId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setMode('connect');
      setSelectedId(id);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-editor-sidebar border border-editor-border rounded-lg shadow-xl w-[450px] max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-editor-border">
          <h2 className="text-sm font-medium text-editor-text">
            {mode === 'add' ? 'New Connection' : mode === 'connect' ? 'Connect' : 'Remote Connections'}
          </h2>
          <button
            onClick={toggleRemoteDialog}
            className="p-1 rounded hover:bg-editor-hover text-editor-text-muted hover:text-editor-text"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.28 3.22a.75.75 0 0 0-1.06 1.06L6.94 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06L8 9.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L9.06 8l3.72-3.72a.75.75 0 0 0-1.06-1.06L8 6.94 4.28 3.22z" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {error && (
            <div className="mb-4 p-2 bg-red-500/20 border border-red-500/50 rounded text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Connected status */}
          {activeRemoteId && mode === 'list' && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-green-400">Connected</span>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="text-xs px-2 py-1 bg-editor-hover rounded hover:bg-red-500/20 text-editor-text-muted hover:text-red-400"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}

          {mode === 'list' && (
            <>
              {/* Connection list */}
              <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
                {remoteConnections.length === 0 ? (
                  <div className="text-center py-8 text-editor-text-muted text-sm">
                    No saved connections
                  </div>
                ) : (
                  remoteConnections.map(conn => (
                    <div
                      key={conn.id}
                      className="flex items-center justify-between p-3 bg-editor-bg rounded border border-editor-border hover:border-editor-accent"
                    >
                      <div>
                        <div className="text-sm text-editor-text">{conn.name}</div>
                        <div className="text-xs text-editor-text-muted">
                          {conn.username}@{conn.host}:{conn.port}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startConnect(conn.id)}
                          disabled={connecting || !!activeRemoteId}
                          className="text-xs px-3 py-1.5 bg-blue-500/20 rounded hover:bg-blue-500/30 text-blue-400 disabled:opacity-50"
                        >
                          {connecting && selectedId === conn.id ? 'Connecting...' : 'Connect'}
                        </button>
                        <button
                          onClick={() => handleDelete(conn.id)}
                          className="p-1 rounded hover:bg-red-500/20 text-editor-text-muted hover:text-red-400"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => setMode('add')}
                className="w-full py-2 bg-editor-accent hover:bg-editor-accent/80 rounded text-sm text-editor-text"
              >
                + Add Connection
              </button>
            </>
          )}

          {mode === 'add' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-editor-text-muted mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="My Server"
                  className="w-full px-3 py-2 bg-editor-bg border border-editor-border rounded text-sm text-editor-text focus:outline-none focus:border-editor-accent"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs text-editor-text-muted mb-1">Host</label>
                  <input
                    type="text"
                    value={form.host}
                    onChange={e => setForm({ ...form, host: e.target.value })}
                    placeholder="example.com"
                    className="w-full px-3 py-2 bg-editor-bg border border-editor-border rounded text-sm text-editor-text focus:outline-none focus:border-editor-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-editor-text-muted mb-1">Port</label>
                  <input
                    type="text"
                    value={form.port}
                    onChange={e => setForm({ ...form, port: e.target.value })}
                    className="w-full px-3 py-2 bg-editor-bg border border-editor-border rounded text-sm text-editor-text focus:outline-none focus:border-editor-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-editor-text-muted mb-1">Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  placeholder="root"
                  className="w-full px-3 py-2 bg-editor-bg border border-editor-border rounded text-sm text-editor-text focus:outline-none focus:border-editor-accent"
                />
              </div>

              <div>
                <label className="block text-xs text-editor-text-muted mb-1">Authentication</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-editor-text">
                    <input
                      type="radio"
                      checked={form.authType === 'password'}
                      onChange={() => setForm({ ...form, authType: 'password' })}
                      className="accent-blue-500"
                    />
                    Password
                  </label>
                  <label className="flex items-center gap-2 text-sm text-editor-text">
                    <input
                      type="radio"
                      checked={form.authType === 'key'}
                      onChange={() => setForm({ ...form, authType: 'key' })}
                      className="accent-blue-500"
                    />
                    SSH Key
                  </label>
                </div>
              </div>

              {form.authType === 'key' && (
                <div>
                  <label className="block text-xs text-editor-text-muted mb-1">Key Path</label>
                  <input
                    type="text"
                    value={form.keyPath}
                    onChange={e => setForm({ ...form, keyPath: e.target.value })}
                    placeholder="~/.ssh/id_rsa"
                    className="w-full px-3 py-2 bg-editor-bg border border-editor-border rounded text-sm text-editor-text focus:outline-none focus:border-editor-accent"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { setMode('list'); setError(null); }}
                  className="flex-1 py-2 bg-editor-hover rounded text-sm text-editor-text-muted hover:text-editor-text"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2 bg-editor-accent hover:bg-editor-accent/80 rounded text-sm text-editor-text"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {mode === 'connect' && selectedId && (
            <div className="space-y-4">
              {(() => {
                const conn = remoteConnections.find(c => c.id === selectedId);
                if (!conn) return null;
                return (
                  <>
                    <div className="text-center">
                      <div className="text-sm text-editor-text">{conn.name}</div>
                      <div className="text-xs text-editor-text-muted">
                        {conn.username}@{conn.host}:{conn.port}
                      </div>
                    </div>

                    {conn.authType === 'password' && (
                      <div>
                        <label className="block text-xs text-editor-text-muted mb-1">Password</label>
                        <input
                          type="password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleConnect()}
                          autoFocus
                          className="w-full px-3 py-2 bg-editor-bg border border-editor-border rounded text-sm text-editor-text focus:outline-none focus:border-editor-accent"
                        />
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => { setMode('list'); setError(null); }}
                        className="flex-1 py-2 bg-editor-hover rounded text-sm text-editor-text-muted hover:text-editor-text"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConnect}
                        disabled={connecting}
                        className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 rounded text-sm text-white disabled:opacity-50"
                      >
                        {connecting ? 'Connecting...' : 'Connect'}
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
