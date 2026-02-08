import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { X, Send, Loader2, Trash2, RefreshCw } from "lucide-react";

import { useChatWindow } from "@/hooks/use-canvas";
import { ChatMessage } from "@/redux/slice/chat";

interface ChatWindowProps {
  generatedUIId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatWindow = ({
  generatedUIId,
  isOpen,
  onClose,
}: ChatWindowProps) => {
  const {
    inputValue,
    setInputValue,
    scrollAreaRef,
    inputRef,
    handleSendMessage,
    handleKeyPress,
    handleClearChat,
    chatState,
  } = useChatWindow(generatedUIId, isOpen);

  return (
    <div
      className={cn(
        "fixed inset-y-0 w-96 rounded-2xl z-50 flex flex-col border backdrop-blur-2xl bg-[var(--canvas-panel-strong)] border-[var(--canvas-panel-border)] text-[var(--canvas-panel-text)] shadow-lg transition-[transform,opacity] duration-300 ease-out",
        isOpen
          ? "translate-x-0 opacity-100"
          : "translate-x-8 opacity-0 pointer-events-none"
      )}
      style={{
        right: "calc(var(--generated-panel-width, 0px) + 20px)",
      }}
    >
      <div className="flex items-center justify-between p-4 border-b border-[var(--canvas-panel-border)]">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-[var(--canvas-panel-text)]" />
          <Label className="text-[var(--canvas-panel-text)] font-medium">
            Design Chat
          </Label>
        </div>
        <div className="flex items-center gap-1">
          {chatState?.messages && chatState.messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              className="h-8 w-8 p-0 text-[var(--canvas-panel-muted)] hover:text-[var(--canvas-panel-text)] hover:bg-[var(--canvas-panel-hover)]">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-[var(--canvas-panel-muted)] hover:text-[var(--canvas-panel-text)] hover:bg-[var(--canvas-panel-hover)]">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {!chatState?.messages || chatState.messages.length === 0 ? (
            <div className="text-center text-[var(--canvas-panel-muted)] py-8">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Ask me to redesign this UI!</p>
              <p className="text-xs mt-1 opacity-75">
                I can change colors, layout, style, content, and more.
              </p>
            </div>
          ) : (
            chatState.messages.map((message: ChatMessage) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-[var(--canvas-panel)] text-[var(--canvas-panel-text)] border border-[var(--canvas-panel-border)]"
                  )}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div
                    className={cn(
                      "text-xs mt-1 opacity-70 flex items-center gap-1",
                    message.role === "user"
                      ? "text-blue-100"
                      : "text-[var(--canvas-panel-muted)]"
                    )}>
                    {message.isStreaming && (
                      <Loader2 size={10} className="animate-spin" />
                    )}
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-[var(--canvas-panel-border)]">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe how you want to redesign this UI..."
              disabled={chatState?.isStreaming}
              className="flex-1 bg-[var(--canvas-panel-strong)] border-[var(--canvas-panel-border)] text-[var(--canvas-panel-text)] placeholder:text-[var(--canvas-panel-muted)]"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || chatState?.isStreaming}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white">
              {chatState?.isStreaming ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </Button>
          </div>
          <div className="text-xs text-[var(--canvas-panel-muted)] text-center">
            Type your redesign request and press Enter
          </div>
        </div>
      </div>
    </div>
  );
};
