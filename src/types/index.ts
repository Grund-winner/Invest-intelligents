export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ConfigMap {
  [key: string]: string;
}

export interface QuickAction {
  label: string;
  icon: string;
  message: string;
}
