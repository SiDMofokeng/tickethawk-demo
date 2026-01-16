
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

export function SettingsForm() {
    const { toast } = useToast();
    const [apiUrl, setApiUrl] = useState('');
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        const savedApiKey = localStorage.getItem('settings-apiKey');
        
        if (typeof window !== 'undefined') {
          const customDomainUrl = `${window.location.origin}/api/tickets`;
          setApiUrl(customDomainUrl);
          localStorage.setItem('settings-apiUrl', customDomainUrl);
        }

        if (savedApiKey) {
            setApiKey(savedApiKey);
        } else {
            const generatedKey = `th_${Math.random().toString(36).substring(2, 22)}`;
            setApiKey(generatedKey);
            localStorage.setItem('settings-apiKey', generatedKey);
        }
    }, []);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        localStorage.setItem('settings-apiUrl', apiUrl);
        localStorage.setItem('settings-apiKey', apiKey);
        toast({
            title: "Settings Saved",
            description: "Your configuration has been updated.",
        });
    }

  return (
    <form onSubmit={handleSubmit}>
        <Card>
        <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
                Update the core settings for Ticket Hawk.
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="api-url">Backend API URL</Label>
                <Input 
                    id="api-url" 
                    placeholder="https://your-backend.com/api/tickets" 
                    value={apiUrl}
                    readOnly
                />
                <p className="text-sm text-muted-foreground">
                    The endpoint where JSON tickets will be sent.
                </p>
            </div>
             <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input 
                    id="api-key" 
                    type="password"
                    value={apiKey} 
                    onChange={(e) => setApiKey(e.target.value)}
                />
                 <p className="text-sm text-muted-foreground">
                    Your secret key for authenticating with the backend API.
                </p>
            </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
            <Button type="submit">Save Settings</Button>
        </CardFooter>
        </Card>
    </form>
  );
}
