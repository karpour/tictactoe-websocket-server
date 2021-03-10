export type GridPosition = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export const CIRCLE = "CIRCLE";
export const CROSS = "CROSS";
export type PlayerSymbol = typeof CIRCLE | typeof CROSS;
export type SquareState = PlayerSymbol | null;

export type TicTacToeGrid = SquareState[];

export type TicTacToeMessage = {
    type: string,
    message?: string;
};

export const MESSAGE_TYPE_SYMBOL_ASSIGN = "SYMBOL_ASSIGN";

export type TicTacToeSymbolAssignMessage = TicTacToeMessage & {
    type: typeof MESSAGE_TYPE_SYMBOL_ASSIGN,
    symbol: PlayerSymbol;
};

export const MESSAGE_TYPE_UPDATE = "UPDATE";

export type TicTacToeUpdateMessage = TicTacToeMessage & {
    type: typeof MESSAGE_TYPE_UPDATE,
    grid: TicTacToeGrid;
};

export const MESSAGE_TYPE_INVALID_MOVE = "INVALID_MOVE";

export type TicTacToeInvalidMoveMessage = {
    type: typeof MESSAGE_TYPE_INVALID_MOVE,
    grid: TicTacToeGrid;
};

export const MESSAGE_TYPE_ERROR = "ERROR";

export type TicTacToeErrorMessage = {
    type: typeof MESSAGE_TYPE_ERROR,
    message: string,
};

// Player messages
export const MESSAGE_TYPE_PLAYER_MOVE = "PLAYER_MOVE";

export type TicTacToePlayerMove = TicTacToeMessage & {
    type: typeof MESSAGE_TYPE_PLAYER_MOVE,
    pos: GridPosition;
};

export const MESSAGE_TYPE_PLAYER_RESET = "PLAYER_RESET";

export type TicTacToePlayerReset = TicTacToeMessage & {
    type: typeof MESSAGE_TYPE_PLAYER_RESET,
};