
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, Memory } from "../types";

const LIVOO_SYSTEM_PROMPT = `You are LiVo, a proactive personal life assistant. 
Your core mission is to be the external brain that connects fragmented pieces of a user's life (tasks, goals, relationships, health, memories).
Be warm, human, proactive, and contextual.
You remember EVERYTHING the user shares.
When responding:
1. Reference past memories if relevant.
2. Be proactive—suggest next steps or notice patterns.
3. Keep it warm and casual.
4. If the user mentions a goal, break it down.
5. If they mention health issues, look for correlations in their history (but never diagnose).
6. Handle inputs like text descriptions of images or voice transcriptions.

User's Memory Bank:
{memories}

Current Date/Time: {now}`;

export class GeminiService {
  private ai: GoogleGenAI;
  // Use gemini-3-pro-preview for complex reasoning and memory extraction tasks as per guidelines
  private model = 'gemini-3-pro-preview';

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    if (!apiKey) {
      throw new Error('Missing VITE_GEMINI_API_KEY. Set it in .env or .env.local.');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async processInput(
    input: string,
    history: ChatMessage[],
    memories: Memory[],
    imageBuffer?: string
  ) {
    const memoryString = memories
      .map((m) => `[${m.timestamp}] ${m.type.toUpperCase()}: ${m.content}`)
      .join("\n");

    const systemInstruction = LIVOO_SYSTEM_PROMPT
      .replace("{memories}", memoryString || "No memories yet.")
      .replace("{now}", new Date().toLocaleString());

    // Map history to the expected Content[] format
    const contents: any[] = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const currentParts: any[] = [{ text: input }];
    if (imageBuffer) {
      currentParts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBuffer.split(",")[1],
        },
      });
    }

    contents.push({
      role: "user",
      parts: currentParts
    });

    try {
      // Call generateContent directly with the model and contents as per guidelines
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      // Correctly access .text property (not a method) on the response object
      return response.text || "I'm processing that. Can you tell me more?";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "I'm having a little trouble connecting to my brain right now. Let's try again in a moment!";
    }
  }

  async extractMemories(input: string, response: string, memories: Memory[]): Promise<Partial<Memory>[]> {
    // This helper asks Gemini to identify any new memories to store
    const schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, description: "note, event, relationship, goal, health, finance, or pattern" },
          content: { type: Type.STRING, description: "the actual nugget of info to remember" }
        },
        required: ["type", "content"]
      }
    };

    try {
      const result = await this.ai.models.generateContent({
        model: this.model,
        contents: `Based on this interaction, what specific details should I add to the long-term memory bank?
        User: "${input}"
        Assistant: "${response}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          systemInstruction: "You are a memory extraction engine for LiVo. Only extract concrete facts, goals, preferences, or patterns."
        }
      });

      // Access .text property directly and parse the JSON string
      return JSON.parse(result.text || "[]");
    } catch (e) {
      return [];
    }
  }
}

export const gemini = new GeminiService();
