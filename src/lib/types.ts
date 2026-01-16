export type AdminRole = 'Admin' | 'Editor' | 'Viewer';

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatarUrl: string;
}

export interface Keyword {
  id: string;
  term: string;
  ticketType: 'Urgent' | 'Support' | 'Feedback' | 'General';
  assignedAdminId: string;
}

export interface Message {
  id: string;
  senderName: string;
  senderNumber: string;
  groupName: string;
  text: string;
  timestamp: string;
}

export type TicketStatus = 'new' | 'in-progress' | 'resolved';

export interface Ticket {
  id: string;
  keywordDetected: string;
  senderName: string;
  senderNumber: string;
  groupName: string;
  timestamp: string;
  fullMessageText: string;
  assignedAdmin: Admin;
  status: TicketStatus;
}
