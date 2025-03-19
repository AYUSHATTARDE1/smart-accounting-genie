
import { useState } from "react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export const useOpenAI = () => {
  const [error, setError] = useState<string | null>(null);

  // In a real implementation, you would use an actual OpenAI API key
  // For demo purposes, we'll simulate the API call
  const getAIResponse = async (
    userInput: string,
    conversationHistory: Message[]
  ): Promise<string> => {
    setError(null);
    
    try {
      // For demonstration purposes, we're using a simulated response
      // In a production app, you would make a real API call to OpenAI
      
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Create a context-aware response based on the user input
      const input = userInput.toLowerCase();
      
      if (input.includes("tax") || input.includes("deduction")) {
        return "Based on your business activity, you might qualify for several tax deductions including home office, business travel, and professional development expenses. I recommend tracking these expenses carefully throughout the year.";
      } else if (input.includes("invoice") || input.includes("billing")) {
        return "I can help you create professional invoices. You can store client information, add line items, and send automated payment reminders to improve your cash flow.";
      } else if (input.includes("expense") || input.includes("spending")) {
        return "Looking at your recent expenses, I notice your software subscription costs have increased by 32% since last year. Would you like me to suggest some cost-saving alternatives?";
      } else if (input.includes("profit") || input.includes("revenue")) {
        return "Your current profit margin is approximately 24%, which is slightly above the industry average of 21%. Let me analyze your revenue streams to see if there are opportunities for further improvement.";
      } else if (input.includes("investment") || input.includes("saving")) {
        return "Based on your cash flow patterns, you could potentially allocate an additional 8% of monthly revenue toward your investment portfolio while maintaining healthy operating capital.";
      } else {
        return "I'm here to help with your financial questions. You can ask me about tax optimization, expense tracking, invoicing, profit analysis, or investment strategies.";
      }
      
      // In production, you would make an actual API call like this:
      /*
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`, // Use environment variable for API key
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful financial assistant that provides advice on accounting, taxes, and business finances.'
            },
            ...conversationHistory.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            {
              role: 'user',
              content: userInput
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content;
      */
    } catch (err) {
      setError("Failed to get response from AI");
      console.error("OpenAI API error:", err);
      throw err;
    }
  };

  return { getAIResponse, error };
};
