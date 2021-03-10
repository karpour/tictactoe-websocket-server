import {
    CIRCLE,
    CROSS,
    GridPosition,
    PlayerSymbol,
    SquareState,
    TicTacToeGrid
} from "./TicTacToeTypes";

export default class TicTacToeGame {
    private _grid!: TicTacToeGrid;
    private currentSymbol: PlayerSymbol;

    public constructor() {
        this.reset();
        this.currentSymbol = CROSS;
    }

    public reset() {
        this._grid = new Array<SquareState>(9).fill(null);
    }

    public get grid(): TicTacToeGrid {
        return this._grid;
    }

    public set grid(grid: TicTacToeGrid) {
        this._grid = grid;
        console.log(this.asciiGrid());
    }

    public takeTurn(pos: GridPosition, playerSymbol: PlayerSymbol) {
        if (!this._grid[pos] && playerSymbol == this.currentSymbol) {
            this._grid[pos] = playerSymbol;
            //console.log(`Player: ${playerSymbol}`);
            //console.log(`Pos: ${pos}`);
            this.currentSymbol = (playerSymbol == CROSS) ? CIRCLE : CROSS;
            return playerSymbol;
        }
        return null;
    }

    public detectWinner(): SquareState {
        let g = this._grid;
        let winner: SquareState = null;
        const checkRow = (row: number) => ((g[row * 3] == g[row * 3 + 1]) && (g[row * 3 + 1] == g[row * 3 + 2])) ? (winner = g[row * 3]) : null;
        const checkCol = (col: number) => ((g[col] == g[col + 3]) && (g[col + 3] == g[col + 6])) ? (winner = g[col + 3]) : null;
        if ((g[0] == g[4]) && (g[4] == g[8])) winner = g[4];
        if ((g[2] == g[4]) && (g[4] == g[6])) winner = g[4];
        for (let i = 0; i < 3 && !winner; i++) {
            checkRow(i);
            checkCol(i);
        }
        return winner;
    }

    public asciiGrid(): string {
        let gs = (symbol: SquareState) => {
            switch (symbol) {
                case CROSS: return "X";
                case CIRCLE: return "O";
                default: return " ";
            }
        };
        let s = this._grid.map((val => gs(val)));
        let line = "-+-+-";
        return `${s[0]}|${s[1]}|${s[2]}\n${line}\n${s[3]}|${s[4]}|${s[5]}\n${line}\n${s[6]}|${s[7]}|${s[8]}`;
    }
}