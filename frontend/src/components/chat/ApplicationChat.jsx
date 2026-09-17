import { useEffect, useState } from "react";
import { FiMessageCircle, FiSend, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import client from "../../api/client";

export default function ApplicationChat({ application, onClose }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { data } = await client.post(
          `/applications/${application.id}/conversation`,
        );
        const conversationData = data.conversation;
        const messagesResponse = await client.get(
          `/conversations/${conversationData.id}/messages`,
        );
        if (active) {
          setConversation(conversationData);
          setMessages(messagesResponse.data.messages);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Unable to open recruiter chat.",
        );
        onClose();
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [application.id, onClose]);

  const submit = async (event) => {
    event.preventDefault();
    if (!text.trim() || !conversation) return;
    setSending(true);
    try {
      const { data } = await client.post(
        `/conversations/${conversation.id}/messages`,
        { text },
      );
      setMessages((current) => [...current, data.message]);
      setText("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Message could not be sent.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-brand/20 bg-slate-50 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-brand/10 p-2 text-brand">
            <FiMessageCircle />
          </div>
          <div>
            <h3 className="font-bold dark:text-white">Chat with recruiter</h3>
            <p className="text-xs text-slate-500">{application.jobTitle}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close chat">
          <FiX />
        </button>
      </div>
      <div className="max-h-64 min-h-32 space-y-2 overflow-y-auto p-4">
        {loading && (
          <p className="text-sm text-slate-500">Opening conversation...</p>
        )}
        {!loading && !messages.length && (
          <p className="text-sm text-slate-500">
            Send a message to introduce yourself to the recruiter.
          </p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className="rounded-xl bg-white p-3 text-sm shadow-sm dark:bg-slate-800"
          >
            <p className="dark:text-slate-100">{message.text}</p>
            <time className="mt-1 block text-[10px] text-slate-400">
              {new Date(message.createdAt).toLocaleString()}
            </time>
          </div>
        ))}
      </div>
      <form
        onSubmit={submit}
        className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-700"
      >
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Write a message..."
          maxLength={2000}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand dark:border-slate-700 dark:bg-slate-800"
        />
        <button
          type="submit"
          disabled={sending || !text.trim() || !conversation}
          aria-label="Send message"
          className="rounded-xl bg-brand px-4 py-2 text-white disabled:opacity-50"
        >
          <FiSend />
        </button>
      </form>
    </div>
  );
}
