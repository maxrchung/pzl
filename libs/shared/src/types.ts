import { GroupConfig } from 'konva/lib/Group';
import { Vector2d } from 'konva/lib/types';
import { PresignedPost } from '@aws-sdk/s3-presigned-post';

/**
 * Piece data maintained on server. On the client side, this gets stuffed in an
 * ImageConfig. We can't directly use ImageConfig here because it contains
 * browser-only types like HTMLImageElement that can't be used on the server.
 * */
export interface PieceConfig {
  id: string;
  groupId: string;
  index: {
    x: number;
    y: number;
  };
  edges: {
    top: Edge;
    right: Edge;
    bottom: Edge;
    left: Edge;
  };
}

export interface Game {
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

  /** How large a tab should be */
  tabLength: number;

  /** What edge style to use */
  edge: Edge;

  pieceConfigs: Record<string, PieceConfig[]>;
  groupConfigs: Record<string, GroupConfig>;
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
  refreshGame: (game: Game) => void;
  moveGroup: (groupId: string, position: Vector2d) => void;
  snapGroup: (fromGroupId: string, toGroupId: string) => void;
  addNotification: (notification: Notification) => void;
}

export interface ClientToServerEvents {
  resetGame: () => void;
  updateImage: (key: string, height: number, width: number) => void;
  updatePieces: (columns: number, rows: number, edge: Edge) => void;
  moveGroup: (groupId: string, position: Vector2d) => void;
  snapGroup: (fromGroupId: string, toGroupId: string) => void;
  presign: (
    contentType: string,
    callback: (presign: PresignedPost) => void,
  ) => void;
  createLobby: (callback: (lobbyId: string) => void) => void;
  joinLobby: (lobbyId: string, callback: (ok: boolean) => void) => void;
  leaveLobby: () => void;
}

export interface SocketData {
  lobbyId?: string;
}

export enum Edge {
  SquareBlank = -1,
  None = 0,
  SquareTab = 1,
}
