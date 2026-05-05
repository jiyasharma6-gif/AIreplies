import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type ReplyTone = 'polite' | 'sales-focused' | 'short-reply' | 'friendly' | 'urgent' | 'hindi' | 'hinglish';
export type AppMode = 'reply' | 'improve' | 'analyze';

export interface ReplyRequest {
  customerMessage: string;
  tone: ReplyTone;
  businessType: string;
  mode: AppMode;
  productContext?: string;
}

export async function generateWhatsAppReply({ customerMessage, tone, businessType, mode, productContext }: ReplyRequest): Promise<string> {
  const systemInstruction = `
    You are a helpful WhatsApp Business Reply Assistant.
    Your goal is to help business owners communicate naturally, professionally, and effectively, like a real human owner.

    BUSINESS TYPE: ${businessType}
    TONE/LANGUAGE: ${tone}

    MODE: ${mode === 'reply' ? 'REPLY TO CUSTOMER' : mode === 'improve' ? 'IMPROVE MY DRAFT' : 'LEAD ANALYZER'}

    CORE PRINCIPLES:
    - STRICT: NEVER generate links, URLs, or website references.
    - STRICT: NEVER invent prices, discounts, offers, or facts not explicitly provided in the input.
    - STRICT: Keep responses extremely short (strictly 1–3 lines maximum).
    - NATURAL TONE: Keep replies natural, warm, and conversational, like a human business owner.
    - SALES & PERSUASION: Focus on benefits and clarity. If a customer is hesitant, ask a clarifying question to understand their needs better.
    - NO FAKE URGENCY: Do NOT exaggerate, create artificial scarcity, or use pushy language.
    - FAQ HANDLING: Answer ONLY based on provided context. If information is missing, ask a follow-up question.
    - ORDERS & APPOINTMENTS: Use ONLY provided details. Do NOT assume or invent info (price, size, availability, slots). Always ask for missing info clearly.
    - DISCOUNTS & OFFERS: Only use the offer/product context provided. Mention it naturally and only once. Do NOT invent prices or deals.
    - GROWTH: Always move the conversation forward toward a clear next step (Confirm, Order, or Visit).
    - LOCALITY: 
        - "hindi": Respond in natural Devanagari Hindi.
        - "hinglish": Respond in natural Hinglish.
    - OUTPUT: Only output the final WhatsApp message. No conversational filler, no quotes, no explanations, no headings, and no formatting.
  `;

  const prompt = mode === 'analyze' 
    ? `
    Analyze this message for a ${businessType} business: "${customerMessage}"
    
    OUTPUT FORMAT:
    Category: (Select: New Inquiry, Interested, Ready to Buy, Just Asking Info, Not Interested)
    Reason: (Short 1-sentence reason)
    Suggested Reply: (A short WhatsApp reply in ${tone} style)
    `
    : `
    Business Category: ${businessType}
    Desired Tone/Language: ${tone}
    Activity: ${mode === 'reply' ? 'Reply to this customer message' : 'Improve this draft message'}
    
    Content to process: "${customerMessage}"
    ${productContext ? `Context Details: ${productContext}` : ''}

    Output ONLY the final WhatsApp message. No quotes, no filler, no explanations, no headings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.6, // Lower temperature for more consistent "receptionist" tone
      }
    });

    return response.text || "Sorry, I couldn't generate a reply. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate reply. Please check your internet or API key.");
  }
}
