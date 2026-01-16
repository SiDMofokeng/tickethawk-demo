
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { TestTube2, Copy, RefreshCw, Loader } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { testWhatsappConnection } from "@/app/actions";

export function WhatsappForm() {
    const { toast } = useToast();
    const [phoneId, setPhoneId] = useState('');
    const [accountId, setAccountId] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [verifyToken, setVerifyToken] = useState('tickethawk-xhm8nieu52');
    const [webhookUrl, setWebhookUrl] = useState('https://studio--studio-564685983-7d822.us-central1.hosted.app/api/webhook');
    const [isTesting, setIsTesting] = useState(false);

    useEffect(() => {
        const savedPhoneId = localStorage.getItem('whatsapp-phoneId') || '';
        const savedAccountId = localStorage.getItem('whatsapp-accountId') || '';
        const savedAccessToken = localStorage.getItem('whatsapp-accessToken') || '';
        
        setPhoneId(savedPhoneId);
        setAccountId(savedAccountId);
        setAccessToken(savedAccessToken);

    }, []);

    const generateAndSetToken = () => {
        const token = `tickethawk-${Math.random().toString(36).substring(2, 12)}`;
        setVerifyToken(token);
        // We don't save this to local storage anymore as the backend has a fixed one.
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied to clipboard!",
        });
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        localStorage.setItem('whatsapp-phoneId', phoneId);
        localStorage.setItem('whatsapp-accountId', accountId);
        localStorage.setItem('whatsapp-accessToken', accessToken);
        toast({
            title: "Configuration Saved",
            description: "Your WhatsApp connection settings have been saved locally.",
        });
    }

    const handleTestConnection = async () => {
        if (!phoneId || !accessToken) {
            toast({
                variant: "destructive",
                title: "Missing Credentials",
                description: "Please fill in the Phone Number ID and Access Token before testing.",
            });
            return;
        }

        setIsTesting(true);
        const result = await testWhatsappConnection(phoneId, accessToken);
        setIsTesting(false);

        if (result.success) {
             toast({
                title: "Connection Successful!",
                description: result.message,
            });
        } else {
            toast({
                variant: "destructive",
                title: "Connection Failed",
                description: result.message,
            });
        }
    }

  return (
    <form onSubmit={handleSubmit}>
        <Card>
            <CardHeader>
                <CardTitle>WhatsApp Business API</CardTitle>
                <CardDescription>
                    Enter your credentials from your Meta for Developers App.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="phone-id">Phone Number ID</Label>
                    <Input 
                        id="phone-id"
                        placeholder="e.g., 109876543210987" 
                        value={phoneId}
                        onChange={(e) => setPhoneId(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                        Find this under <span className="font-semibold">WhatsApp &gt; API Setup</span> in your App settings.
                    </p>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="account-id">WhatsApp Business Account ID</Label>
                    <Input 
                        id="account-id" 
                        placeholder="e.g., 101234567890123" 
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                    />
                     <p className="text-sm text-muted-foreground">
                        Also found under <span className="font-semibold">WhatsApp &gt; API Setup</span>.
                    </p>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="access-token">Permanent Access Token</Label>
                    <Input 
                        id="access-token" 
                        type="password" 
                        placeholder="Begins with EAA..." 
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                    />
                     <p className="text-sm text-muted-foreground">
                        Generate a permanent token under <span className="font-semibold">WhatsApp &gt; API Setup</span> in Step 2.
                    </p>
                </div>
            </CardContent>
            <Separator />
             <CardHeader>
                <CardTitle>Webhook Configuration</CardTitle>
                <CardDescription>
                    Use these values to set up the webhook in your Meta for Developers App.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <div className="flex items-center gap-2">
                         <Input 
                            id="webhook-url" 
                            readOnly
                            value={webhookUrl}
                        />
                        <Button variant="outline" size="icon" type="button" onClick={() => copyToClipboard(webhookUrl)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Copy this URL into the "Callback URL" field in your app's <span className="font-semibold">WhatsApp &gt; Configuration</span> page.
                    </p>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="verify-token">Verify Token</Label>
                     <div className="flex items-center gap-2">
                        <Input 
                            id="verify-token" 
                            readOnly
                            value={verifyToken}
                        />
                        <Button variant="outline" size="icon" type="button" onClick={() => copyToClipboard(verifyToken)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                     <p className="text-sm text-muted-foreground">
                        Copy this token into the "Verify token" field. This token must match the one used for verification.
                    </p>
                </div>
            </CardContent>
            <CardFooter className="justify-between border-t px-6 py-4">
                <Button variant="outline" type="button" onClick={handleTestConnection} disabled={isTesting}>
                    {isTesting ? (
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <TestTube2 className="mr-2 h-4 w-4" />
                    )}
                    Test Connection
                </Button>
                <Button type="submit">Save Configuration</Button>
            </CardFooter>
        </Card>
    </form>
  );
}
