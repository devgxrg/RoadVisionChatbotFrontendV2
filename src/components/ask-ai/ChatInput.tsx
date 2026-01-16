import React, { useState, useRef, useEffect } from "react";
import { Send, Loader, Upload, X, FileText, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload: (files: File[]) => void;
  disabled: boolean;
  isUploading: boolean;
}

export function ChatInput({
  onSendMessage,
  onFileUpload,
  disabled,
  isUploading,
}: ChatInputProps) {
  const [inputMessage, setInputMessage] = useState("");
  // 1. Changed state to array to support multiple files
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); 
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  const handleSend = () => {
    if (disabled || (!inputMessage.trim() && selectedFiles.length === 0)) return;
    onSendMessage(inputMessage);
    setInputMessage("");
    // Optional: Clear files after send if desired
    // setSelectedFiles([]); 
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      setInputMessage("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const fileList = e.target.files;
    const newFiles: File[] = [];

    for (let i = 0; i < fileList.length; i++) {
      newFiles.push(fileList[i]);
    }

    if (newFiles.length > 0) {
      // 2. Append new files to existing list and trigger upload prop
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      onFileUpload(newFiles);
    }

    if (e.target) e.target.value = "";
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="bg-background/80 backdrop-blur-sm border-t p-4 pb-1">
      {/* 3. Added relative positioning to container for the top-right button */}
      <div className="relative flex flex-col gap-4 border rounded-lg p-2 focus-within:border-primary transition-all focus-within:shadow">
        
        {/* 4. The Top-Right 'Uploaded Files' Button */}
        {selectedFiles.length > 0 && (
          <div className="absolute top-2 right-2 z-10">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="h-7 text-xs gap-1.5 shadow-sm bg-muted hover:bg-muted/80"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span className="font-medium">{selectedFiles.length} Uploaded</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-3 border-b bg-muted/30">
                  <h4 className="font-medium text-sm">Attached Documents</h4>
                </div>
                <ScrollArea className="h-[200px] p-2">
                  <div className="flex flex-col gap-2">
                    {selectedFiles.map((file, index) => (
                      <div 
                        key={`${file.name}-${index}`} 
                        className="flex items-center justify-between gap-2 p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors group"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate max-w-[180px]" title={file.name}>
                              {file.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Ceigall AI anything..."
          // 5. Added padding-right (pr-32) to prevent text from going under the button
          className={`w-full focus:outline-none resize-none overflow-hidden bg-transparent text-foreground placeholder:text-muted-foreground ${selectedFiles.length > 0 ? 'pr-32' : ''}`}
          disabled={disabled}
          rows={1}
        />
        
        <div className="flex items-center justify-between">
          <div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              variant="default"
              className="gap-2"
            >
              {isUploading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">Upload File</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              multiple 
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={disabled || (!inputMessage.trim() && selectedFiles.length === 0)}
            size="icon"
          >
            {disabled && !isUploading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-2">
        Shift+Enter for new line. Esc to clear.
      </p>
    </div>
  );
}
