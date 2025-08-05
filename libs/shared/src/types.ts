import { GroupConfig } from 'konva/lib/Group.js';
import { ImageConfig } from 'konva/lib/shapes/Image.js';

export interface SecretState {
  connections: number;
}

/** Contains only the essential data needed to maintain on server */
export interface PieceData {
  id: string;
  groupId: string;
  index: {
    x: number;
    y: number;
  };
}

export type DataMap = { [groupId: string]: PieceData[] };

/** Client uses this type, which contains additional parameters like HTML image
 * element */
export type PieceConfig = PieceData & ImageConfig;

export type PiecesMap = { [groupId: string]: PieceConfig[] };

export type ConfigMap = { [groupId: string]: GroupConfig };

export interface GameState {
  /** How much to crop from the image */
  cropSize: {
    height: number;
    width: number;
  };

  /** How large a piece is on canvas */
  pieceSize: {
    height: number;
    width: number;
  };

  data: DataMap;
  configs: ConfigMap;
}

export interface ServerToClientEvents {
  refreshSecret: (secret: SecretState) => void;
  refreshGame: (game: GameState) => void;
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
