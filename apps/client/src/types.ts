export interface ModalProps {
  isOpen: boolean;
}

export interface ModalEmits {
  (e: 'close'): void;
}
