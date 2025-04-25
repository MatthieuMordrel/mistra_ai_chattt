import { cachedValidateServerSession } from "@/lib/auth/validateSession";

export default async function ChatPage() {
  await cachedValidateServerSession(true);
  return <></>;
}
