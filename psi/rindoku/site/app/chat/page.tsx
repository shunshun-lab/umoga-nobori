import { getAvailableChapters } from "@/lib/chat-context";
import ChatUI from "./ChatUI";

export const metadata = { title: "チャット" };

export default function ChatPage() {
  const chapters = getAvailableChapters();
  return <ChatUI chapters={chapters} />;
}
