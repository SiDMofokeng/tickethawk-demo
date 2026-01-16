
import type { Admin, Keyword, Message, Ticket, TicketStatus, AdminRole } from './types';

export const admins: Admin[] = [
  { id: 'admin-1', name: 'Alex Johnson', email: 'alex@example.com', role: 'Admin', avatarUrl: 'https://picsum.photos/seed/101/40/40' },
  { id: 'admin-2', name: 'Maria Garcia', email: 'maria@example.com', role: 'Editor', avatarUrl: 'https://picsum.photos/seed/102/40/40' },
  { id: 'admin-3', name: 'Dev Team', email: 'devteam@example.com', role: 'Editor', avatarUrl: 'https://picsum.photos/seed/103/40/40' },
  { id: 'admin-4', name: 'Support Team', email: 'support@example.com', role: 'Viewer', avatarUrl: 'https://picsum.photos/seed/104/40/40' },
];

export const keywords: Keyword[] = [
  { id: 'kw-1', term: 'urgent', ticketType: 'Urgent', assignedAdminId: 'admin-1' },
  { id: 'kw-2', term: 'help', ticketType: 'Support', assignedAdminId: 'admin-4' },
  { id: 'kw-3', term: 'broken', ticketType: 'Urgent', assignedAdminId: 'admin-3' },
  { id: 'kw-4', term: 'feedback', ticketType: 'Feedback', assignedAdminId: 'admin-2' },
  { id: 'kw-5', term: 'issue', ticketType: 'Support', assignedAdminId: 'admin-4' },
  { id: 'kw-6', term: 'request', ticketType: 'General', assignedAdminId: 'admin-2' },
];

export const initialMessages: Message[] = [
  { id: 'msg-1', senderName: 'Bob', senderNumber: '+15551234567', groupName: 'Project Alpha', text: "Can someone help me with the login page? It seems to be broken.", timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
  { id: 'msg-2', senderName: 'Charlie', senderNumber: '+15557654321', groupName: 'Marketing Team', text: "I have some feedback on the new campaign.", timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
  { id: 'msg-3', senderName: 'Diana', senderNumber: '+15551112233', groupName: 'General Chat', text: "What's the status on the server migration?", timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
];

export const moreMessages: Message[] = [
    { id: 'msg-4', senderName: 'Eve', senderNumber: '+15554445566', groupName: 'Project Beta', text: "This is an urgent request regarding the client demo.", timestamp: new Date().toISOString() },
    { id: 'msg-5', senderName: 'Frank', senderNumber: '+15557778899', groupName: 'Support Queries', text: "I need help with my account settings.", timestamp: new Date().toISOString() },
    { id: 'msg-6', senderName: 'Grace', senderNumber: '+15559998877', groupName: 'Project Alpha', text: "Just a quick question about the timeline.", timestamp: new Date().toISOString() },
    { id: 'msg-7', senderName: 'Heidi', senderNumber: '+15556665544', groupName: 'Marketing Team', text: "There's an issue with the latest ad analytics.", timestamp: new Date().toISOString() },
];

let initialTicketsData = [
    { 
        id: 'TKT-001', 
        keywordDetected: 'broken', 
        senderName: 'Bob', 
        senderNumber: '+15551234567', 
        groupName: 'Project Alpha', 
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), 
        fullMessageText: "Can someone help me with the login page? It seems to be broken.", 
        assignedAdminId: 'admin-3', 
        status: 'new' as TicketStatus
    },
    { 
        id: 'TKT-002', 
        keywordDetected: 'feedback', 
        senderName: 'Charlie', 
        senderNumber: '+15557654321', 
        groupName: 'Marketing Team', 
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), 
        fullMessageText: "I have some feedback on the new campaign.", 
        assignedAdminId: 'admin-2',
        status: 'in-progress' as TicketStatus
    }
];

export const initialTickets: Ticket[] = initialTicketsData.map(ticket => {
    const admin = admins.find(a => a.id === ticket.assignedAdminId);
    if (!admin) throw new Error(`Admin with id ${ticket.assignedAdminId} not found`);
    return {
        ...ticket,
        assignedAdmin: admin,
    }
});


export function createTicketFromMessage(message: Message, keyword: Keyword, admin: Admin): Ticket {
  return {
    id: `TKT-${String(Date.now()).slice(-4)}`,
    keywordDetected: keyword.term,
    senderName: message.senderName,
    senderNumber: message.senderNumber,
    groupName: message.groupName,
    timestamp: message.timestamp,
    fullMessageText: message.text,
    assignedAdmin: admin,
    status: 'new'
  };
}
