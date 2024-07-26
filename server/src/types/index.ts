type SortOrderType = 1 | -1;

export interface SortQuery {
  [key: string]: SortOrderType;
}

export interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}
