
"use server";

import { suggestRelevantKeywords } from "@/ai/flows/suggest-relevant-keywords";
import { z } from "zod";

const schema = z.object({
  conversationHistory: z.string().min(10, { message: "Conversation history must be at least 10 characters long." }),
});

export async function suggestKeywordsAction(prevState: any, formData: FormData) {
  try {
    const validatedFields = schema.safeParse({
      conversationHistory: formData.get('conversationHistory'),
    });

    if (!validatedFields.success) {
      return {
        message: "Validation failed",
        errors: validatedFields.error.flatten().fieldErrors,
        suggestions: [],
      };
    }

    const result = await suggestRelevantKeywords({ conversationHistory: validatedFields.data.conversationHistory });

    if (!result || !result.suggestedKeywords || result.suggestedKeywords.length === 0) {
        return {
            message: "No new keywords were suggested. Try a different conversation history.",
            errors: null,
            suggestions: [],
        }
    }

    return {
      message: "Success",
      errors: null,
      suggestions: result.suggestedKeywords,
    };
  } catch (error) {
    console.error(error);
    return {
      message: "An unexpected error occurred.",
      errors: null,
      suggestions: [],
    };
  }
}

export async function testWhatsappConnection(phoneId: string, accessToken: string) {
    if (!phoneId || !accessToken) {
        return { success: false, message: "Phone Number ID and Access Token are required." };
    }

    try {
        const url = `https://graph.facebook.com/v20.0/${phoneId}?access_token=${accessToken}`;
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok && data.id) {
            return { success: true, message: "Connection to WhatsApp API was successful!" };
        } else {
            return { success: false, message: data.error?.message || "Failed to connect. Please check your credentials." };
        }
    } catch (error) {
        console.error("WhatsApp connection test error:", error);
        return { success: false, message: "An unexpected error occurred during the connection test." };
    }
}
