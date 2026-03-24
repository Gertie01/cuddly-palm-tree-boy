"use client";

import { Button } from "@/components/ui/button";
import { Download, RotateCcw, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { HistoryItem, HistoryPart } from "@/lib/types";

interface ImageResultDisplayProps {
  imageUrl: string;
  description: string | null;
  onReset: () => void;
  conversationHistory?: HistoryItem[];
}

export function ImageResultDisplay({
  imageUrl,
  description,
  onReset,
  conversationHistory = [],
}: ImageResultDisplayProps) {
  const [showHistory, setShowHistory] = useState(false);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `gemini-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Generated Image</h2>
        
        <div className="relative w-full h-96 mb-4">
          <Image
            src={imageUrl}
            alt="Generated image"
            fill
            className="object-contain"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleDownload} className="flex items-center gap-2">
            <Download size={20} />
            Download
          </Button>

          {conversationHistory.length > 0 && (
            <Button 
              onClick={toggleHistory}
              variant="outline"
              className="flex items-center gap-2"
            >
              <MessageCircle size={20} />
              {showHistory ? "Hide History" : "Show History"}
            </Button>
          )}

          <Button 
            onClick={onReset}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw size={20} />
            Create New Image
          </Button>
        </div>
      </div>

      {description && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-2">Description</h3>
          <p className="text-gray-700">{description}</p>
        </div>
      )}

      {showHistory && conversationHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Conversation History</h3>
          
          <div className="space-y-4">
            {conversationHistory.map((item, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <p className="font-semibold text-sm text-gray-600">
                  {item.role === "user" ? "You" : "Gemini"}
                </p>
                
                <div className="mt-2">
                  {item.parts.map((part: HistoryPart, partIndex) => (
                    <div key={partIndex}>
                      {part.text && <p className="text-gray-800">{part.text}</p>}
                      {part.image && (
                        <div className="relative w-full h-48 mt-2">
                          <Image
                            src={part.image}
                            alt="History image"
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
