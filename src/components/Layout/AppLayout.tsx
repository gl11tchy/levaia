import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useEditorStore } from '../../stores/editorStore';
import { MenuBar } from '../MenuBar/MenuBar';
import { FileExplorer } from '../FileExplorer/FileExplorer';
import { EditorTabs } from '../Editor/EditorTabs';
import { Editor } from '../Editor/Editor';
import { TerminalTabs } from '../Terminal/TerminalTabs';
import { TerminalPanel } from '../Terminal/TerminalPanel';
import { QuickOpen } from '../QuickOpen/QuickOpen';

export function AppLayout() {
  const { sidebarVisible, terminalVisible, quickOpenVisible } = useEditorStore();

  return (
    <div className="h-screen w-screen flex flex-col bg-editor-bg text-editor-text overflow-hidden">
      <MenuBar />

      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" autoSaveId="main-horizontal">
          {sidebarVisible && (
            <>
              <Panel
                defaultSize={20}
                minSize={15}
                maxSize={40}
                id="sidebar"
                order={1}
              >
                <FileExplorer />
              </Panel>
              <PanelResizeHandle className="w-[1px] bg-editor-border hover:bg-editor-accent transition-colors" />
            </>
          )}

          <Panel id="main" order={2}>
            <PanelGroup direction="vertical" autoSaveId="main-vertical">
              <Panel id="editor" order={1}>
                <div className="h-full flex flex-col">
                  <EditorTabs />
                  <div className="flex-1 overflow-hidden">
                    <Editor />
                  </div>
                </div>
              </Panel>

              {terminalVisible && (
                <>
                  <PanelResizeHandle className="h-[1px] bg-editor-border hover:bg-editor-accent transition-colors" />
                  <Panel
                    defaultSize={30}
                    minSize={10}
                    maxSize={80}
                    id="terminal"
                    order={2}
                  >
                    <div className="h-full flex flex-col bg-editor-bg">
                      <TerminalTabs />
                      <div className="flex-1 overflow-hidden">
                        <TerminalPanel />
                      </div>
                    </div>
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>

      {quickOpenVisible && <QuickOpen />}
    </div>
  );
}
