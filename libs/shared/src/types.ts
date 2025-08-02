export interface SecretState {
  connections: number;
}

export interface ServerToClientEvents {
  resetSecret: (data: SecretState) => void;
  resetState: () => void;
  movePiece: () => void;
  moveGroup: () => void;
}

export interface ClientToServerEvents {
  resetSecret: () => void;
  uploadImage: () => void;
  updateSides: () => void;
  movePiece: () => void;
}
