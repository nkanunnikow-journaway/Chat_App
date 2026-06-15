import Button from '../ui/Button.tsx';
import { useRef, useState } from 'react';

type MessageInputProps = {
  onSendMessage: (text: string, file: File | null) => void;
};

function MessageInput({ onSendMessage }: MessageInputProps) {
  const [messageText, setMessageText] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleAttachment() {
    fileInputRef.current?.click();
  }

  function handleSendMessage() {
    if (messageText.trim() === '' && !attachedFile) {
      return;
    }
    onSendMessage(messageText, attachedFile);
    setMessageText('');
    setAttachedFile(null);
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  }
  return (
    <footer className="border-t border-gray-200 bg-white p-4">
      {attachedFile && (
        <div className="mb-3 relative w-fit">
          <img src={URL.createObjectURL(attachedFile)} alt="Vorschau" className="h-20 w-20 rounded-xl object-cover" />
          <button
            onClick={() => setAttachedFile(null)}
            className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs hover:bg-red-600 transition"
          >
            ✕
          </button>
        </div>
      )}
      <div className="flex gap-3">
        <input
          className="flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-indigo-500"
          placeholder="Nachricht schreiben..."
          value={messageText}
          onChange={(event) => setMessageText(event.target.value)}
        />
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelected} />
        <Button onClick={handleAttachment}>Attach</Button>
        <Button onClick={handleSendMessage}>Send</Button>
      </div>
    </footer>
  );
}

export default MessageInput;
