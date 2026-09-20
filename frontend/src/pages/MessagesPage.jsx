import { useSearchParams } from "react-router-dom";
import ConversationHistory from "../components/chat/ConversationHistory";

export default function MessagesPage() {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get("conversationId");
  const applicationId = searchParams.get("applicationId");

  return (
    <div className="w-full py-2">
      <div className="mb-4">
        <h1 className="text-2xl font-bold dark:text-white sm:text-3xl">
          Messages & Communications
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Direct messaging with candidates and recruiters regarding active applications.
        </p>
      </div>

      <ConversationHistory
        initialConversationId={conversationId}
        initialApplicationId={applicationId}
      />
    </div>
  );
}
