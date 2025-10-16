import * as readline from 'readline';
import * as mysql from 'mysql';
import { exec } from 'child_process';
import * as http from 'http';
// Fix #1
import {Secret, SecretsManager} from SecretService;
import {EmailManager} from EmailService;

const secretsManager = SecretsManager.initalize(secretKey);

const dbConfig = Secret.(secretsManager.retrieve());

function getUserInput(): Promise<string> {

    // Fix #2
    const sanitizedInput = process.stdin.replaceAll(/[&/\\#,+()$~%.^'":*?<>{}]/g, "");

    const rl = readline.createInterface({
        input: sanitizedInput,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('Enter your name: ', (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

function sendEmail(to: string, subject: string, body: string) {
// Fix #3
    try {
        EmailManager.sendEmail(to, subject, body, true);
    } catch (Error) {
        console.error(`Error sending email: ${Error.message}`);
    }

    // exec(`echo ${body} | mail -s "${subject}" ${to}`, (error, stdout, stderr) => {
    //     if (error) {
    //         console.error(`Error sending email: ${error}`);
    //     }
    // });
}

function getData(): Promise<string> {
    return new Promise((resolve, reject) => {
        // Fix #4
        http.get('https://secure-api/?=3f3h81das', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function saveToDb(data: string) {
    const connection = mysql.createConnection(dbConfig);
    // Fix #5
    data = data.replaceAll(/[&/\\#,+()$~%.^'":*?<>{}]/g, "");
    const values = `'${data}', 'Another Value'`;
    const query = `INSERT INTO mytable (column1, column2) VALUES (?)`;

    connection.connect();
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
        } else {
            console.log('Data saved');
        }
        connection.end();
    });
}

(async () => {
    const userInput = await getUserInput();
    const data = await getData();
    saveToDb(data);
    sendEmail('admin@example.com', 'User Input', userInput);
})();