import WebSocket, { Data } from 'ws';
import {
    CIRCLE,
    CROSS,
    MESSAGE_TYPE_ERROR,
    MESSAGE_TYPE_INVALID_MOVE,
    MESSAGE_TYPE_PLAYER_MOVE,
    MESSAGE_TYPE_PLAYER_RESET,
    MESSAGE_TYPE_SYMBOL_ASSIGN,
    MESSAGE_TYPE_UPDATE,
    PlayerSymbol,
    TicTacToeErrorMessage,
    TicTacToeInvalidMoveMessage,
    TicTacToePlayerMove,
    TicTacToePlayerReset,
    TicTacToeSymbolAssignMessage,
    TicTacToeUpdateMessage
} from './TicTacToeTypes';
import { IncomingMessage } from 'http';
import TicTacToeGame from './TicTacToeGame';

export default class TicTacToeServer {
    private _wss: WebSocket.Server;
    private _game!: TicTacToeGame;

    private _playerConnections: { [key in PlayerSymbol]: WebSocket | undefined };

    public constructor(port: number = 48080) {
        console.log(`TicTacToe Server started on port ${port}`);
        this._playerConnections = {
            CIRCLE: undefined,
            CROSS: undefined
        };
        this._game = new TicTacToeGame();

        this._wss = new WebSocket.Server({ port: port, });

        this._wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
            let symbol: PlayerSymbol | undefined = this.assignPlayer(ws);
            if (symbol) {

                let player: PlayerSymbol = symbol;
                // Free slot, assign symbol
                this.sendPlayerMessage({ type: MESSAGE_TYPE_SYMBOL_ASSIGN, symbol: player }, player);

                console.log(`Player ${player} connected from ${req.socket.remoteAddress}`);

                this.broadcastGridUpdate();
                ws.on('message', (data: Data) => {
                    try {
                        let playerMessage = this.decodePlayerMessage(data);
                        if (playerMessage.type == MESSAGE_TYPE_PLAYER_MOVE) {
                            if (!this._game.detectWinner() && this._game.takeTurn(playerMessage.pos, player)) {
                                let winner = this._game.detectWinner();
                                if (winner) {
                                    console.log(`${winner} won`);
                                }
                                this.broadcastGridUpdate();
                            } else {
                                this.sendPlayerMessage({
                                    type: MESSAGE_TYPE_INVALID_MOVE,
                                    grid: this._game.grid
                                }, player);
                            }
                        } else if (playerMessage.type == MESSAGE_TYPE_PLAYER_RESET) {
                            this._game.reset();
                            this.broadcastGridUpdate();
                        }
                    } catch (err) {
                        this.sendPlayerMessage({
                            type: MESSAGE_TYPE_ERROR,
                            message: err.message
                        }, player);
                    }
                });

                ws.on('close', (code: number, reason: string) => {
                    console.log(`Player ${player} disconnected`);
                    this.removePlayer(player);
                    //this._game.reset();
                    //this.broadcastGridUpdate();
                });
            } else {
                // server full, send error message
                ws.send(JSON.stringify({ type: MESSAGE_TYPE_ERROR, message: "Server full" }));
                ws.close();
            }
        });
    }

    private decodePlayerMessage(data: Data): TicTacToePlayerMove | TicTacToePlayerReset {
        if (typeof (data) == "string") {
            console.log(`<< ${data}`);
            try {
                let dataObject: any = JSON.parse(data);
                if (dataObject.type == MESSAGE_TYPE_PLAYER_MOVE || dataObject.type == MESSAGE_TYPE_PLAYER_RESET) {
                    return dataObject as (TicTacToePlayerMove | TicTacToePlayerReset);
                }
                console.log(`Unknown type "${dataObject.type}"`);
                throw new Error(`Unknown type "${dataObject.type}"`);
            } catch (err) {
                console.error(err);
                throw new Error("Could not parse data");
            }
        }
        throw new Error("Data is not string");
    }

    private assignPlayer(ws: WebSocket): PlayerSymbol | undefined {
        if (!this._playerConnections[CROSS]) {
            this._playerConnections[CROSS] = ws;
            return CROSS;
        } else if (!this._playerConnections[CIRCLE]) {
            this._playerConnections[CIRCLE] = ws;
            return CIRCLE;
        }
        return undefined;
    }

    private removePlayer(player: PlayerSymbol): void {
        this._playerConnections[player] = undefined;
    }

    private broadCastMessage(message: TicTacToeUpdateMessage): void {
        this.sendPlayerMessage(message, CIRCLE);
        this.sendPlayerMessage(message, CROSS);
    }

    private broadcastGridUpdate(): void {
        this.broadCastMessage({
            type: MESSAGE_TYPE_UPDATE,
            grid: this._game.grid
        });
        console.log(this._game.asciiGrid());
    }

    private sendPlayerMessage(message: TicTacToeErrorMessage | TicTacToeSymbolAssignMessage | TicTacToeUpdateMessage | TicTacToeInvalidMoveMessage, player: PlayerSymbol): void {
        let connection = this._playerConnections[player];
        if (connection) {
            let data = JSON.stringify(message);
            console.log(`>> ${data}`);
            connection.send(data);
        }
    }
}
