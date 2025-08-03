export interface SecretState {
  connections: number;
}

export interface ServerToClientEvents {
  refreshSecret: (data: SecretState) => void;
  refreshGame: () => void;
  movePiece: () => void;
  moveGroup: () => void;
}

export interface ClientToServerEvents {
  refreshSecret: () => void;
  uploadImage: () => void;
  updateSides: () => void;
  movePiece: () => void;
}
