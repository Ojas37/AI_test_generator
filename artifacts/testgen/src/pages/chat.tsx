import { useState, useRef, useEffect } from "react";
import { useListChatMessages, useSendChatMessage, getListChatMessagesQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const getSessionId = () => {
  let id = localStorage.getItem("aero_qa_chat_session");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("aero_qa_chat_session", id);
  }
  return id;
};

export default function Chat() {
  const sessionId = getSessionId();
  const [input, setInput] = useState("");
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useListChatMessages({ sessionId });
  const sendMessage = useSendChatMessage();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;

    const content = input;
    setInput("");

    sendMessage.mutate({
      data: { sessionId, content }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListChatMessagesQueryKey({ sessionId }) });
      }
    });
  };

  const handleExampleClick = (text: string) => {
    setInput(text);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full max-h-screen">
        <div className="p-6 md:p-8 pb-4 border-b">
          <h1 className="text-3xl font-bold tracking-tight">AI Refinement</h1>
          <p className="text-muted-foreground mt-1">Converse with the generation engine to refine test cases.</p>
        </div>

        <div className="flex-1 overflow-hidden p-6 md:p-8 flex flex-col max-w-4xl mx-auto w-full">
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            {messages?.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 mt-20">
                <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">How can I help you refine your tests?</h3>
                  <p className="text-muted-foreground mt-2 max-w-md">
                    Ask me to generate specific edge cases, modify existing suites, or explain coverage gaps.
                  </p>
                </div>
                <div className="grid gap-2 w-full max-w-md">
                  <Button variant="outline" className="justify-start h-auto py-3 px-4 text-left" onClick={() => handleExampleClick("Add negative tests for the payment endpoint")}>
                    "Add negative tests for the payment endpoint"
                  </Button>
                  <Button variant="outline" className="justify-start h-auto py-3 px-4 text-left" onClick={() => handleExampleClick("Generate tests for the 2FA flow")}>
                    "Generate tests for the 2FA flow"
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-4">
                {messages?.map((msg) => (
                  <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div className={`px-4 py-3 rounded-xl max-w-[80%] ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                        : 'bg-muted rounded-tl-sm'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-secondary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {sendMessage.isPending && (
                  <div className="flex gap-4 justify-start">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="px-4 py-3 rounded-xl bg-muted rounded-tl-sm flex items-center gap-2">
                      <div className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="mt-4 pt-4 border-t">
            <form onSubmit={handleSend} className="flex gap-2">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask the agent to refine tests..." 
                className="flex-1"
                disabled={sendMessage.isPending}
              />
              <Button type="submit" disabled={!input.trim() || sendMessage.isPending}>
                <Send className="h-4 w-4 mr-2" /> Send
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}