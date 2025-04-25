import { fetchConversation } from "../fetchClient/fetchConversation";

export function queryOptionsConversation({
  conversationId,
}: {
  conversationId?: string | null;
}) {
  return {
    queryKey: ["conversation", conversationId ?? "null"],
    queryFn: fetchConversation,
    refetchOnMount: false,
  };
}
