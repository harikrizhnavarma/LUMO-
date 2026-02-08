"use client";

import { InfiniteCanvas } from "@/components/canvas";
import { ChatWindow } from "@/components/canvas/shapes/generatedui/chat";
import { useGlobalChat } from "@/hooks/use-canvas";
import { GeneratedPanel } from "./generated-panel";

export const CanvasWorkspace = () => {
  const {
    isChatOpen,
    activeGeneratedUIId,
    closeChat,
    toggleChat,
    generateWorkflow,
    exportDesign,
  } = useGlobalChat();

  return (
    <div className="relative flex h-full w-full overflow-hidden canvas-prism">
      <div className="grid-master" />
      <div className="float-blob pd-blob" />
      <div className="relative z-10 flex-1 min-w-0">
        <InfiniteCanvas
          toggleChat={toggleChat}
          generateWorkflow={generateWorkflow}
          exportDesign={exportDesign}
        />
      </div>

      <GeneratedPanel
        toggleChat={toggleChat}
        generateWorkflow={generateWorkflow}
        exportDesign={exportDesign}
        isChatOpen={isChatOpen}
        activeChatId={activeGeneratedUIId}
      />

      {activeGeneratedUIId && (
        <ChatWindow
          generatedUIId={activeGeneratedUIId}
          isOpen={isChatOpen}
          onClose={closeChat}
        />
      )}
    </div>
  );
};
