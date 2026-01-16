# **App Name**: Ticket Hawk

## Core Features:

- Message Monitoring: Continuously monitors WhatsApp group messages in real-time for keyword triggers.
- Keyword Detection: Detects admin-defined keywords within messages and triggers actions accordingly.
- Ticket Generation: Automatically creates structured JSON ticket payloads when keywords are detected, including sender and group details.
- Admin Routing: Routes created tickets to the appropriate admin team based on keyword mapping configuration.
- Backend API Integration: Sends JSON tickets to a backend API endpoint for processing and action.
- Silent Operation: Operates silently in the background, avoiding direct responses in group chats.
- Intelligent Tool Keyword Recommendation: Suggests new keywords based on analysis of conversation history using an LLM tool, to improve ticket relevance and coverage.

## Style Guidelines:

- Primary color: Deep blue (#2962FF) to evoke trust and efficiency in communication management.
- Background color: Light grey (#F5F7FA), to make for comfortable prolonged use and integrate well into admin's workflow context.
- Accent color: Bright orange (#FF8F00) to highlight critical alerts and actionable items.
- Body and headline font: 'Inter' sans-serif for a clear, modern and easily readable text throughout the application.
- Use consistent, easily recognizable icons to represent ticket status and administrative actions.
- Clean and efficient layout, prioritizing key data fields and actions within the ticket views.
- Subtle animations to indicate real-time updates and successful actions, like ticket submission confirmations.