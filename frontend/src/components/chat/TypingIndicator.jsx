import React from "react";

export default function TypingIndicator({ userName }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400">
      <div className="flex items-center gap-1 rounded-full bg-slate-200/70 px-2.5 py-1 dark:bg-slate-800">
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-brand" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-brand" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-brand" />
      </div>
      <span className="italic">
        {userName ? `${userName} is typing...` : "Typing..."}
      </span>
    </div>
  );
}
