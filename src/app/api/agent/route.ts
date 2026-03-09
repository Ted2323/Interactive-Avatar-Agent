import { NextRequest, NextResponse } from "next/server";
import type OpenAI from "openai";
import { openai, SYSTEM_PROMPT, agentTools, executeTool } from "@/lib/openai";
import { AgentRequest, AgentResponse } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: AgentRequest = await req.json();
    const { messages } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const conversationMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map(
        (m) =>
          ({ role: m.role, content: m.content } as OpenAI.Chat.ChatCompletionMessageParam)
      ),
    ];

    const toolsUsed: string[] = [];

    // Agentic loop — allow up to 5 tool call rounds
    for (let round = 0; round < 5; round++) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: conversationMessages,
        tools: agentTools,
        tool_choice: "auto",
        max_tokens: 512,
        temperature: 0.7,
      });

      const choice = response.choices[0];

      if (choice.finish_reason === "tool_calls" && choice.message.tool_calls) {
        // Add assistant message with tool calls
        conversationMessages.push(choice.message);

        // Execute each tool and append results
        for (const rawToolCall of choice.message.tool_calls) {
          // Cast to the concrete function-call type
          const toolCall = rawToolCall as {
            id: string;
            type: "function";
            function: { name: string; arguments: string };
          };

          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments || "{}");
          const toolResult = executeTool(toolName, toolArgs);

          toolsUsed.push(toolName);

          conversationMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: toolResult,
          });
        }

        continue;
      }

      // Model gave a final text response
      const reply =
        choice.message.content ?? "I'm sorry, I couldn't generate a response.";
      const result: AgentResponse = { reply, toolsUsed };
      return NextResponse.json(result);
    }

    return NextResponse.json({
      reply: "I reached the maximum reasoning steps. Please try again.",
      toolsUsed,
    });
  } catch (error) {
    console.error("Agent API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
