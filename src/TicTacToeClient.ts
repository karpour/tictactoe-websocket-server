import WebSocket, { Data } from 'ws';
import TicTacToeGame from './TicTacToeGame';
import { GridPosition, MESSAGE_TYPE_ERROR, MESSAGE_TYPE_INVALID_MOVE, MESSAGE_TYPE_PLAYER_MOVE, MESSAGE_TYPE_PLAYER_RESET, MESSAGE_TYPE_SYMBOL_ASSIGN, MESSAGE_TYPE_UPDATE, PlayerSymbol, TicTacToeErrorMessage, TicTacToeInvalidMoveMessage, TicTacToePlayerMove, TicTacToePlayerReset, TicTacToeSymbolAssignMessage, TicTacToeUpdateMessage } from './TicTacToeTypes';

export default class TicTacToeClient {
    private _ws: WebSocket;
    private _game: TicTacToeGame;
    private _symbol: PlayerSymbol;

    protected constructor(ws: WebSocket, symbol: PlayerSymbol) {
        this._ws = ws;
        this._ws.on('message', (data: Data) => {
            try {
                let serverMessage = this.decodeServerMessage(data);
                if (serverMessage.type == MESSAGE_TYPE_UPDATE) {
                    this._game.grid = serverMessage.grid;
                } else if (serverMessage.type == MESSAGE_TYPE_INVALID_MOVE) {
                    console.log("Invalid move");
                } else if (serverMessage.type == MESSAGE_TYPE_ERROR) {
                    console.log(`Error: ${serverMessage.message}`);
                }
            } catch (err) {
                console.log(err.message);
            }
        });
        this._symbol = symbol;
        this._game = new TicTacToeGame();
    }

    public get symbol(): PlayerSymbol {
        return this._symbol;
    }

    protected decodeServerMessage(data: Data): TicTacToeUpdateMessage | TicTacToeInvalidMoveMessage | TicTacToeErrorMessage {
        if (typeof (data) == "string") {
            console.log(`<< ${data}`);
            try {
                let dataObject: any = JSON.parse(data);

                if (dataObject.type == MESSAGE_TYPE_INVALID_MOVE || dataObject.type == MESSAGE_TYPE_UPDATE || dataObject.type == MESSAGE_TYPE_ERROR) {
                    return dataObject as (TicTacToeUpdateMessage | TicTacToeInvalidMoveMessage | TicTacToeErrorMessage);
                }
                console.log(`Unknown type "${dataObject.type}"`);
                throw new Error(`Unknown type "${dataObject.type}"`);
            } catch (err) {
                console.error(err);
                throw new Error("Could not parse data");
            }
        }
        throw new Error(`Data is not a string`);
    }

    public static async connect(url: string): Promise<TicTacToeClient> {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(url);
            ws.on('open', () => {
                console.log(`Opened connection`);
            });
            ws.on('message', (data: Data) => {
                if (typeof (data) == "string") {
                    let parsedData = JSON.parse(data) as TicTacToeSymbolAssignMessage;
                    if (parsedData.type == MESSAGE_TYPE_SYMBOL_ASSIGN) {
                        resolve(new TicTacToeClient(ws, parsedData.symbol));
                    } else {
                        reject(`Expected type ${MESSAGE_TYPE_SYMBOL_ASSIGN}, got ${parsedData.type}`);
                    }
                } else {
                    reject("Data is not string");
                }
            });
        });
    }

    public sendMessage(message: TicTacToePlayerMove | TicTacToePlayerReset): void {
        console.log(`>> ${JSON.stringify(message)}`);
        this._ws.send(JSON.stringify(message));
    }

    public sendPlayerMove(pos: GridPosition): void {
        this.sendMessage({
            type: MESSAGE_TYPE_PLAYER_MOVE,
            pos: pos
        });
    }

    public sendReset(): void {
        this.sendMessage({
            type: MESSAGE_TYPE_PLAYER_RESET,
        });
    }
}
