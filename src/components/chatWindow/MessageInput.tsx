import { Paperclip, Send, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type MessageInputProps = {
  onSendMessage: (text: string, file: File | null) => void;
};

function MessageInput({ onSendMessage }: MessageInputProps) {
  const { t } = useTranslation();
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

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  }

  return (
    <footer className="bg-bg-message-in px-4 py-3">
      {attachedFile && (
        <div className="mb-3 relative w-fit">
          <img src={URL.createObjectURL(attachedFile)} alt="preview" className="h-16 w-16 rounded-xl object-cover" />
          <button
            onClick={() => setAttachedFile(null)}
            className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs hover:bg-red-600 transition"
          >
            <X size={10} />
          </button>
        </div>
      )}
      <div className="flex gap-2 items-center">
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelected} />
        <input
          className="flex-1 rounded-xl border border-primary-border bg-bg-chat px-4 py-2.5 text-sm text-text-main outline-none focus:border-primary transition placeholder:text-text-muted"
          placeholder={t('chat.placeholder')}
          value={messageText}
          onChange={(event) => setMessageText(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleAttachment}
          title={t('chat.attach')}
          className="flex items-center justify-center w-9 h-9 rounded-lg text-text-muted hover:bg-primary-light hover:text-primary transition shrink-0"
        >
          <Paperclip size={18} />
        </button>
        <button
          onClick={handleSendMessage}
          title={t('chat.send')}
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-white hover:bg-primary-dark transition shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </footer>
  );
}

export default MessageInput;
