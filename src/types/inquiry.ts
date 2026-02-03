export type InquiryStatus = 'UNREAD' | 'READ' | 'ANSWERED';

export interface Inquiry {
  id: string;
  title: string;
  content: string;
  authorName: string;
  status: InquiryStatus;
  customerId?: string | null;
  customer?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}
