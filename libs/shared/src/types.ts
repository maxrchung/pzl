import { GroupConfig } from 'konva/lib/Group.js';
import { Vector2d } from 'konva/lib/types.js';

/**
 * Piece data maintained on server. On the client side, this gets stuffed in an
 * ImageConfig. We can't directly use ImageConfig here because it contains
 * browser-only types like HTMLImageElement that can't be used on the server.
 * */
export interface PieceData {
  id: string;
  groupId: string;
  index: {
    x: number;
    y: number;
  };
}

export type DataMap = Record<string, PieceData[]>;

export type ConfigMap = Record<string, GroupConfig>;

export interface GameState {
  sides: {
    columns: number;
    rows: number;
  };

  // Timestamp since game was last reset
  resetTime: number;

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
  refreshGame: (game: GameState) => void;
  moveGroup: (groupId: string, position: Vector2d) => void;
  snapGroup: (fromGroupId: string, toGroupId: string) => void;
  addNotification: (notification: Notification) => void;
}

export interface ClientToServerEvents {
  resetGame: () => void;
  updateImage: (key: string, height: number, width: number) => void;
  updateSides: (columns: number, rows: number) => void;
  moveGroup: (groupId: string, position: Vector2d) => void;
  snapGroup: (fromGroupId: string, toGroupId: string) => void;
}
