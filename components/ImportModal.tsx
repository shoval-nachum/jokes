import React, { useState } from 'react';
import { X, Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { Author, Joke } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newJokes: Joke[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<Joke[]>([]);
  const [step, setStep] = useState<'input' | 'preview'>('input');

  if (!isOpen) return null;

  const parseWhatsAppChat = (input: string) => {
    const lines = input.split('\n');
    const newJokes: Joke[] = [];
    
    // Regex patterns for common WhatsApp export formats
    // Android/Web: 12/05/2022, 10:30 - Author: Message
    // iOS: [12/05/2022, 10:30:00] Author: Message
    const androidRegex = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),? \d{1,2}:\d{2}.*? - ([^:]+): (.+)$/;
    const iosRegex = /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),? \d{1,2}:\d{2}.*?\] ([^:]+): (.+)$/;

    lines.forEach(line => {
      // Remove LTR/RTL marks if present
      const cleanLine = line.replace(/[\u200e\u200f]/g, "").trim();
      
      let match = cleanLine.match(androidRegex) || cleanLine.match(iosRegex);
      
      if (match) {
        const [_, dateStr, authorStr, content] = match;
        
        // Skip media omitted messages
        if (content.includes("Media omitted") || content.includes("image omitted")) return;

        // Map author names
        let author: Author | undefined;
        const lowerAuthor = authorStr.toLowerCase();
        
        if (lowerAuthor.includes('amiram') || lowerAuthor.includes('עמירם')) author = Author.Amiram;
        else if (lowerAuthor.includes('david') || lowerAuthor.includes('דוד') || lowerAuthor.includes('raskin')) author = Author.David;
        else if (lowerAuthor.includes('shoval') || lowerAuthor.includes('שובל')) author = Author.Shoval;

        if (author) {
          // Normalize date to dd/mm/yyyy
          let formattedDate = dateStr;
          const dateParts = dateStr.split('/');
          if (dateParts[2].length === 2) {
             formattedDate = `${dateParts[0]}/${dateParts[1]}/20${dateParts[2]}`;
          }

          newJokes.push({
            id: crypto.randomUUID(),
            date: formattedDate,
            author: author,
            content: content.trim()
          });
        }
      } else {
        // Handle multi-line messages (append to previous joke if exists)
        if (newJokes.length > 0 && line.trim() !== '') {
           // Simple heuristic: if it doesn't look like a date start, append
           const lastJoke = newJokes[newJokes.length - 1];
           lastJoke.content += '\n' + line.trim();
        }
      }
    });

    return newJokes;
  };

  const handleParse = () => {
    const parsed = parseWhatsAppChat(text);
    setPreview(parsed);
    setStep('preview');
  };

  const handleConfirm = () => {
    onImport(preview);
    handleClose();
  };

  const handleClose = () => {
    setText('');
    setPreview([]);
    setStep('input');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Upload size={20} className="text-blue-500"/>
            Import from WhatsApp
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          {step === 'input' ? (
            <div className="space-y-4">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm flex gap-3 items-start">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5"/>
                <div>
                    <p className="font-bold mb-1">How to import:</p>
                    <ol className="list-decimal list-inside space-y-1 opacity-90">
                        <li>Open your WhatsApp group chat</li>
                        <li>Export Chat (without media) or select and copy messages</li>
                        <li>Paste the text below</li>
                    </ol>
                </div>
              </div>
              <textarea
                className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                placeholder="Paste WhatsApp chat log here...&#10;Example: 12/05/2022, 10:30 - Amiram: Joke text here"
                value={text}
                onChange={(e) => setText(e.target.value)}
              ></textarea>
            </div>
          ) : (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-gray-700">Preview ({preview.length} jokes found)</h3>
                    <button onClick={() => setStep('input')} className="text-sm text-blue-600 hover:underline">Edit Text</button>
                </div>
                {preview.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        No valid jokes found. Check the format.
                    </div>
                ) : (
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                        {preview.map((joke) => (
                            <div key={joke.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm flex gap-3">
                                <span className="text-xs font-mono text-gray-400 whitespace-nowrap">{joke.date}</span>
                                <span className="font-bold text-gray-700 whitespace-nowrap">{joke.author.split(' ')[0]}:</span>
                                <span className="text-gray-800" dir="auto">{joke.content}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          {step === 'input' ? (
             <button 
                onClick={handleParse}
                disabled={!text.trim()}
                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
             >
                <FileText size={18} />
                Parse Text
             </button>
          ) : (
             <button 
                onClick={handleConfirm}
                disabled={preview.length === 0}
                className="px-6 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
             >
                <Check size={18} />
                Import {preview.length} Jokes
             </button>
          )}
        </div>

      </div>
    </div>
  );
};