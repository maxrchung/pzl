export interface ServerToClientEvents {
  resetState: () => void;
  movePiece: () => void;
  moveGroup: () => void;
}

export interface ClientToServerEvents {
  uploadImage: () => void;
  updateSides: () => void;
  movePiece: () => void;
}
