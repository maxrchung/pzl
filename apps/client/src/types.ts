export type NotificationType = 'info' | 'error';

export interface Notification {
  id: symbol;
  message: string;
  icon: string;
  type?: NotificationType;
}

export interface ModalProps {
  isOpen: boolean;
}

export interface ModalEmits {
  (e: 'close'): void;
}
