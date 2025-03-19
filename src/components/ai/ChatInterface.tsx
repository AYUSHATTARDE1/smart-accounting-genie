
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CustomButton } from "@/components/ui/custom-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowUp, Bot, User, Loader2, Paperclip } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useOpenAI } from "@/hooks/use-openai";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: "1",
    content: "Hello! I'm your AI financial assistant. How can I help you today?",
    sender: "ai",
    timestamp: new Date(),
  },
];

// Example queries to help users get started
const exampleQueries = [
  "How can I optimize my tax deductions?",
  "What's a good business expense strategy?",
  "How should I track my business travel expenses?",
  "What's the optimal retirement investment strategy?",
  "How can I improve my profit margins?",
  "What's the best way to handle my business invoicing?",
];

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [taxOptimizations, setTaxOptimizations] = useState<string[]>([]);
  const [isLoadingOptimizations, setIsLoadingOptimizations] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { getAIResponse, getTaxOptimizations, error } = useOpenAI();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e?: React.FormEvent, predefinedMessage?: string) => {
    e?.preventDefault();
    
    const messageText = predefinedMessage || input;
    if (!messageText.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Get response from OpenAI
      const aiResponse = await getAIResponse(messageText, messages);
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: aiResponse,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get a response from the AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = async (value: string) => {
    setActiveTab(value);
    
    if (value === "tax-optimization" && taxOptimizations.length === 0) {
      setIsLoadingOptimizations(true);
      try {
        const optimizations = await getTaxOptimizations([]);
        setTaxOptimizations(optimizations);
      } catch (error) {
        console.error('Error getting tax optimizations:', error);
        toast({
          title: "Error",
          description: "Failed to load tax optimization suggestions.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingOptimizations(false);
      }
    }
  };

  return (
    <Card className="max-w-5xl mx-auto h-[75vh] flex flex-col shadow-subtle border-border">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-xl flex items-center">
          <Bot className="w-5 h-5 mr-2 text-primary" />
          AI Financial Assistant
        </CardTitle>
      </CardHeader>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
        <div className="border-b">
          <TabsList className="px-4">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="tax-optimization">Tax Optimization</TabsTrigger>
            <TabsTrigger value="insights">Financial Insights</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0">
          <CardContent className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex w-full",
                    message.sender === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "flex items-start gap-2 max-w-[80%]",
                      message.sender === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full",
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      )}
                    >
                      {message.sender === "user" ? (
                        <User className="h-5 w-5" />
                      ) : (
                        <Bot className="h-5 w-5" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "rounded-lg px-4 py-3 text-sm",
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start w-full">
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="rounded-lg px-4 py-3 text-sm bg-secondary text-secondary-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {messages.length === 1 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                {exampleQueries.map((query, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start text-left h-auto py-2"
                    onClick={() => handleSendMessage(undefined, query)}
                  >
                    {query}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
          
          <div className="p-4 border-t border-border mt-auto">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Ask about your finances, taxes, or business advice..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                variant="outline" 
                size="icon" 
                type="button" 
                className="hidden sm:flex"
                disabled={isLoading}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <CustomButton
                type="submit"
                disabled={isLoading || !input.trim()}
                variant={!input.trim() ? "secondary" : "default"}
                size="icon"
              >
                <ArrowUp className="h-4 w-4" />
              </CustomButton>
            </form>
          </div>
        </TabsContent>
        
        <TabsContent value="tax-optimization" className="flex-1 p-0 m-0">
          <CardContent className="h-full overflow-y-auto p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Smart Tax Optimization Suggestions</h3>
              <p className="text-muted-foreground">
                Based on your expense data and business profile, here are some personalized tax optimization recommendations:
              </p>
              
              {isLoadingOptimizations ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-3 mt-6">
                  {taxOptimizations.map((optimization, index) => (
                    <div key={index} className="p-4 bg-secondary/30 rounded-lg border border-border">
                      {optimization}
                    </div>
                  ))}
                  
                  <div className="pt-4">
                    <Button variant="outline" className="w-full">
                      Download Full Tax Optimization Report
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="insights" className="flex-1 p-0 m-0">
          <CardContent className="h-full overflow-y-auto p-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Financial Insights</h3>
              <p className="text-muted-foreground">
                AI-powered analysis of your financial data to help you make better business decisions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Card className="shadow-subtle border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Expense Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Your top expense categories for the last quarter:
                    </p>
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Software Subscriptions</span>
                        <span className="font-medium">$1,245.82</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Office Rent</span>
                        <span className="font-medium">$3,750.00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Marketing</span>
                        <span className="font-medium">$958.30</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-subtle border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Cash Flow Forecast</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Based on your historical data, here's your projected cash flow:
                    </p>
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Next Month</span>
                        <span className="font-medium text-green-600">+$4,230</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Q3 Projection</span>
                        <span className="font-medium text-green-600">+$12,850</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Year-End Estimate</span>
                        <span className="font-medium text-green-600">+$48,200</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-subtle border-border md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">AI Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-secondary/30 rounded-md">
                        Your software expenses increased by 22% compared to last year. Consider auditing subscriptions for unused services.
                      </div>
                      <div className="p-3 bg-secondary/30 rounded-md">
                        Based on your growth rate, you may need to increase your cash reserves by $15,000 to maintain optimal liquidity.
                      </div>
                      <div className="p-3 bg-secondary/30 rounded-md">
                        Your current profit margins (24%) are above industry average (21%). Maintain your current pricing strategy.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ChatInterface;
