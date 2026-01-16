
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { suggestKeywordsAction } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BrainCircuit, Loader, Sparkles } from "lucide-react";
import { Badge } from "../ui/badge";

const initialState = {
    message: "",
    errors: null,
    suggestions: [],
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? (
                <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                </>
            ) : (
                <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Suggest Keywords
                </>
            )}
        </Button>
    );
}

export function KeywordSuggester() {
    const [state, formAction] = useActionState(suggestKeywordsAction, initialState);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-primary" />
                    AI Keyword Suggester
                </CardTitle>
                <CardDescription>
                    Paste conversation history to get new keyword recommendations.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="conversationHistory">Conversation History</Label>
                        <Textarea
                            id="conversationHistory"
                            name="conversationHistory"
                            placeholder="Paste a relevant part of a WhatsApp conversation here..."
                            rows={8}
                        />
                        {state.errors?.conversationHistory && (
                            <p className="text-sm font-medium text-destructive">
                                {state.errors.conversationHistory[0]}
                            </p>
                        )}
                    </div>
                    <SubmitButton />
                </form>

                {state.suggestions && state.suggestions.length > 0 && (
                    <div className="mt-6">
                        <h4 className="font-semibold mb-2">Suggested Keywords:</h4>
                        <div className="flex flex-wrap gap-2">
                            {state.suggestions.map((suggestion, index) => (
                                <Badge key={index} variant="outline" className="text-sm border-green-500 text-green-700 bg-green-50">
                                    {suggestion}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
                 {state.message && state.message !== "Success" && (
                    <p className="mt-4 text-sm text-muted-foreground">{state.message}</p>
                 )}
            </CardContent>
        </Card>
    );
}
