import { GroupConfig } from 'konva/lib/Group.js';
import { ImageConfig } from 'konva/lib/shapes/Image.js';
import { Vector2d } from 'konva/lib/types.js';

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

export type DataMap = Record<string, PieceData[]>;

/** Client uses this type, which contains additional parameters like HTML image
 * element */
export type PieceConfig = PieceData & ImageConfig;

export type PiecesMap = Record<string, PieceConfig[]>;

export type ConfigMap = Record<string, GroupConfig>;

export interface GameState {
  sides: {
    columns: number;
    rows: number;
  };

  /** S3 image key */
  imageKey: string;

  /** Full S3 image URL */
  imageUrl: string;

  /** How large the image is */
  imageSize: {
    height: number;
    width: number;
  };

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

export type NotificationType = 'info' | 'error';

export interface Notification {
  id?: symbol;
  message: string;
  icon: string;
  type?: NotificationType;
  isPermanent?: boolean;
}

export interface ServerToClientEvents {
  refreshSecret: (secret: SecretState) => void;
  refreshGame: (game: GameState) => void;
  moveGroup: (groupId: string, position: Vector2d) => void;
  snapGroup: (fromGroupId: string, toGroupId: string) => void;
  addNotification: (notification: Notification) => void;
}

export interface ClientToServerEvents {
  refreshSecret: () => void;
  resetGame: () => void;
  updateImage: (key: string, height: number, width: number) => void;
  updateSides: (columns: number, rows: number) => void;
  moveGroup: (groupId: string, position: Vector2d) => void;
  snapGroup: (fromGroupId: string, toGroupId: string) => void;
}
