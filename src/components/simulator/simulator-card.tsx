
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Keyword, Admin } from '@/lib/types';
import { Search, CheckCircle, XCircle, UserCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAppContext } from '@/context/app-context';

interface SimulationResult {
    matched: boolean;
    keyword?: Keyword;
    assignedAdmin?: Admin;
}

export function SimulatorCard() {
    const [message, setMessage] = useState('');
    const [result, setResult] = useState<SimulationResult | null>(null);
    const { keywords, admins } = useAppContext();

    const handleTestMessage = () => {
        const words = message.toLowerCase().split(/\s+/);
        let match: SimulationResult = { matched: false };

        for (const word of words) {
            const cleanWord = word.replace(/[.,!?]/g, '');
            const matchedKeyword = keywords.find(kw => kw.term.toLowerCase() === cleanWord);

            if (matchedKeyword) {
                const assignedAdmin = admins.find(a => a.id === matchedKeyword.assignedAdminId);
                match = { matched: true, keyword: matchedKeyword, assignedAdmin };
                break;
            }
        }
        setResult(match);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Test a Message</CardTitle>
                <CardDescription>
                    Enter a sample message to see if it would create a ticket.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="message">Message Text</Label>
                    <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type or paste a WhatsApp message here..."
                        rows={6}
                    />
                </div>
                <Button onClick={handleTestMessage} className="w-full">
                    <Search className="mr-2 h-4 w-4" />
                    Test Message
                </Button>

                {result && (
                    <div className="pt-4">
                        <h4 className="font-semibold mb-2 text-lg">Simulation Result</h4>
                        {result.matched && result.keyword && result.assignedAdmin ? (
                            <Alert variant="default" className="border-green-500 bg-green-50 text-green-900">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <AlertTitle className="font-bold">Keyword Matched!</AlertTitle>
                                <AlertDescription className="space-y-3 mt-2">
                                   <p>The message would create a ticket.</p>
                                    <div className="flex items-center gap-4 p-3 bg-white rounded-md border border-green-200">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Keyword Detected</p>
                                            <p className="font-semibold">{result.keyword.term}</p>
                                        </div>
                                        <div className="border-l border-green-200 h-8 mx-2"></div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Ticket Type</p>
                                            <p className="font-semibold">{result.keyword.ticketType}</p>
                                        </div>
                                        <div className="border-l border-green-200 h-8 mx-2"></div>

                                        <div className="flex items-center gap-2">
                                             <p className="text-sm text-muted-foreground">Assigned To</p>
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={result.assignedAdmin.avatarUrl} alt="Admin" />
                                                <AvatarFallback>{result.assignedAdmin.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-semibold">{result.assignedAdmin.name}</span>
                                        </div>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <Alert variant="destructive" className="border-amber-500 bg-amber-50 text-amber-900">
                                <XCircle className="h-5 w-5 text-amber-600" />
                                <AlertTitle className="font-bold">No Keyword Match</AlertTitle>
                                <AlertDescription>
                                    This message would not create a ticket based on the current keyword list.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
