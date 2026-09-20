import { useState, useRef, useEffect } from "react";
import {
  FiSend,
  FiSmile,
  FiX,
  FiFile,
  FiCornerUpLeft,
} from "react-icons/fi";
import FileUploader from "./FileUploader";

const QUICK_EMOJIS = ["👍", "👋", "😊", "💼", "🎯", "🚀", "🙌", "🤝", "✅"];

export default function ChatInput({
  onSendMessage,
  onTyping,
  onStopTyping,
  disabled,
  replyTo,
  onCancelReply,
}) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sending, setSending] = useState(false);
  const inputRef = useRef(null);
  const emojiRef = useRef(null);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Focus input on reply or change
    if (replyTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyTo]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (onTyping) onTyping();

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      if (onStopTyping) onStopTyping();
    }, 2000);
  };

  const handleAttachmentUploaded = (attachment) => {
    setAttachments((prev) => [...prev, attachment]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const addEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if ((!trimmed && !attachments.length) || disabled || sending) return;

    if (onStopTyping) onStopTyping();
    setSending(true);

    try {
      let messageText = trimmed;
      if (replyTo) {
        messageText = `> Re: ${replyTo.senderName || "Message"}: "${(replyTo.text || "").slice(0, 60)}..."\n\n${messageText}`;
      }

      await onSendMessage({
        text: messageText,
        attachments,
      });

      setText("");
      setAttachments([]);
      if (onCancelReply) onCancelReply();
    } finally {
      setSending(false);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition">
      {/* Reply Quote Banner */}
      {replyTo && (
        <div className="flex items-center justify-between border-b border-slate-100 bg-brand/5 px-4 py-2 text-xs dark:border-slate-800 dark:bg-brand/10">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <FiCornerUpLeft className="text-brand" />
            <span>
              Replying to <b className="text-brand">{replyTo.senderName}</b>:{" "}
              <span className="italic text-slate-500 dark:text-slate-400">
                "{(replyTo.text || "Attachment").slice(0, 50)}..."
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            aria-label="Cancel reply"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* Attachments Preview Tray */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pt-2.5">
          {attachments.map((att, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 rounded-lg border border-brand/30 bg-brand/5 px-2.5 py-1 text-xs font-medium text-brand dark:bg-brand/15"
            >
              <FiFile className="shrink-0" />
              <span className="max-w-[140px] truncate">{att.fileName}</span>
              <button
                type="button"
                onClick={() => removeAttachment(idx)}
                className="ml-1 text-slate-400 hover:text-rose-500"
                aria-label="Remove attachment"
              >
                <FiX />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input row */}
      <form
        onSubmit={handleSend}
        className="flex items-end gap-2 p-3 sm:gap-3"
      >
        {/* Attachment Upload Button */}
        <FileUploader
          onAttachmentUploaded={handleAttachmentUploaded}
          disabled={disabled || sending}
        />

        {/* Emoji Selector */}
        <div className="relative" ref={emojiRef}>
          <button
            type="button"
            disabled={disabled || sending}
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            aria-label="Add emoji"
            className="rounded-xl p-2.5 text-slate-400 transition hover:bg-slate-100 hover:text-brand dark:hover:bg-slate-800 dark:hover:text-brand"
          >
            <FiSmile className="text-lg" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-2 flex gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-800 z-30">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => addEmoji(emoji)}
                  className="rounded-lg p-1.5 text-base transition hover:scale-125 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message Input Box */}
        <div className="relative min-w-0 flex-1">
          <textarea
            ref={inputRef}
            rows="1"
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for newline)"
            disabled={disabled || sending}
            maxLength={2000}
            className="block max-h-32 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand focus:bg-white focus:ring-1 focus:ring-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={
            disabled ||
            sending ||
            (!text.trim() && !attachments.length)
          }
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand font-bold text-white shadow-sm transition hover:bg-brand/90 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          {sending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <FiSend className="text-base" />
          )}
        </button>
      </form>
    </div>
  );
}
