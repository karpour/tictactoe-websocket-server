import readline from 'readline';
import TicTacToeClient from './TicTacToeClient';
import { GridPosition } from './TicTacToeTypes';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


async function main() {
    const client = await TicTacToeClient.connect("ws://localhost:8080");

    rl.on('line', function (line) {
        let numberValue: GridPosition | undefined = undefined;
        try {
            let n = parseInt(line);
            if (n >= 0 && n <= 8) numberValue = n as GridPosition;
        } catch (err) { }

        if (numberValue != undefined) {
            client.sendPlayerMove(numberValue);
            return;
        }
        if (line === "r") client.sendReset();
        if (line === "q") rl.close();
    }).on('close', function () {
        process.exit(0);
    });
}

main();