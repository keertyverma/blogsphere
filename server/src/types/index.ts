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

export interface EditorJsBlock {
  id: string;
  type: string;
  data: Record<string, any>;
}

export interface BlogMetadata {
  title: string;
  summary: string;
  tags: string[];
}
