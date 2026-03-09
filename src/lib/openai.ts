import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const SYSTEM_PROMPT = `You are an intelligent AI assistant with an interactive avatar. You are helpful, concise, and engaging.

You have access to tools for:
- Searching the web for current information
- Performing calculations
- Answering general knowledge questions

Keep responses conversational and concise (2-4 sentences max) since they will be spoken aloud by an avatar. Avoid bullet points or markdown formatting in your responses — use plain, natural speech.`;

export const agentTools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_current_time",
      description: "Get the current date and time",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate",
      description: "Perform a mathematical calculation",
      parameters: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "The mathematical expression to evaluate, e.g. '2 + 2' or 'sqrt(144)'",
          },
        },
        required: ["expression"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get mock weather information for a city (demo purposes)",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "The city name to get weather for",
          },
        },
        required: ["city"],
      },
    },
  },
];

export function executeTool(
  toolName: string,
  args: Record<string, string>
): string {
  switch (toolName) {
    case "get_current_time":
      return `Current time: ${new Date().toLocaleString()}`;

    case "calculate": {
      try {
        // Safe evaluation for basic math expressions
        const sanitized = args.expression.replace(/[^0-9+\-*/().%, sqrt]/g, "");
        const result = Function(`"use strict"; return (${sanitized})`)();
        return `Result: ${result}`;
      } catch {
        return "Could not evaluate that expression.";
      }
    }

    case "get_weather": {
      const conditions = ["sunny", "cloudy", "partly cloudy", "rainy", "windy"];
      const temps = [18, 22, 25, 15, 28, 12];
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      const temp = temps[Math.floor(Math.random() * temps.length)];
      return `Weather in ${args.city}: ${condition}, ${temp}°C (demo data)`;
    }

    default:
      return "Tool not found.";
  }
}
