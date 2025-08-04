import { GroupConfig } from 'konva/lib/Group.js';
import { ImageConfig } from 'konva/lib/shapes/Image.js';

export interface SecretState {
  connections: number;
}

export interface PieceConfig extends ImageConfig {
  pieceX: number;
  pieceY: number;
  groupId: string;
}

export type PiecesMap = { [groupId: string]: PieceConfig[] };

export type ConfigMap = { [groupId: string]: GroupConfig };

export interface ServerToClientEvents {
  refreshSecret: (secret: SecretState) => void;
  refreshGame: (pieces: PiecesMap, configs: ConfigMap) => void;
  movePiece: () => void;
  moveGroup: () => void;
}

export interface ClientToServerEvents {
  refreshSecret: () => void;
  resetGame: () => void;
  uploadImage: () => void;
  updateSides: () => void;
  movePiece: () => void;
}
