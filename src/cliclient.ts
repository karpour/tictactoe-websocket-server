import readline from 'readline';
import TicTacToeClient from './TicTacToeClient';
import { GridPosition } from './TicTacToeTypes';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


async function main() {
    let server = "localhost";
    let port = 48080;

    if (process.argv[2]) server = process.argv[2];

    let address = `ws://${server}:${port}`;

    const client = await TicTacToeClient.connect(address);

    //console.log(`Connected to ${address}`);

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