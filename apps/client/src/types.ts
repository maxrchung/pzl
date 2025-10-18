export interface Notification {
  id: symbol;
  message: string;
  icon: string;
}

export interface ModalProps {
  isOpen: boolean;
}

export interface ModalEmits {
  (e: 'close'): void;
}
