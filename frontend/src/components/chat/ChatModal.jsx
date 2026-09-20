import ApplicationChat from "./ApplicationChat";

export default function ChatModal({
  isOpen,
  onClose,
  application,
  conversationId,
  otherPartyName,
  jobTitle,
}) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl transition dark:bg-slate-900">
        <ApplicationChat
          application={application}
          conversationId={conversationId}
          otherPartyName={otherPartyName}
          jobTitle={jobTitle}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
