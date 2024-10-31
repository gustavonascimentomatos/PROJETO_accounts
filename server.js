import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs';

console.log(chalk.green.bold("Iniciando o projeto Accounts!"));

operation();

function operation() {
    // Possibilita escolher opções dentro do terminal
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'O que você deseja fazer?',
            // Escolhas, possíveis respostas
            choices: ['Criar Conta','Consultar Saldo','Realizar Deposito','Realizar Saque','Sair']
        }
    ])
    .then((answer) => {
        const action = answer['action'];
        console.log(action);

        switch (action) {
            case 'Criar Conta':
                createAccountWelcome();
                buildAccount();
                break;
            case 'Consultar Saldo':
                balance();
                break;
            case 'Realizar Deposito':
                deposit();
                break; 
            case 'Realizar Saque':
                withdraw();
                break;
            default:
                console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'));
                process.exit();
        }
    })
    .catch(error => console.log(error))
}

function createAccountWelcome() {
    console.log(chalk.bgGreen.black.bold('Bem vindo ao Accounts!'));
    console.log(chalk.green('Defina as opções da sua conta a seguir:'));
}

function buildAccount() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite um nome para a sua conta:'
        }
    ])
    .then(answer => {
        const accountName = answer['accountName'];
        createDirectory();
        createAccountFile(accountName);
    })
    .catch(error => console.log(error));
}

function createDirectory() {
    if (!fs.existsSync('accounts')) {
        fs.mkdir('accounts', { recursive: true }, (error) => {
            if (error) { return console.error(error); }
            console.log('Diretório "accounts" criado com sucesso!');
        });
    }
}

function createAccountFile(accountName) {
    if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log("Esta conta já existe!");
        buildAccount();
    } else {
        fs.writeFileSync(
            `accounts/${accountName}.json`,
            '{"balance": 0}',
            function(error) {
                console.log(error);
            },
        )
        console.log('Parabéns, a sua conta foi criada com sucesso!');
        operation();
    }    
}

function validateAccountExists(accountName) {
    if (fs.existsSync(`accounts/${accountName}.json`)) {
        return true;
    } else {
        console.log(chalk.bgBlue.black('Conta não encontrada!'));
        return false;
    }
}

function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf-8',
        flag: 'r'
    })

    return JSON.parse(accountJSON);
}

function balance() {
    console.clear();
    inquirer.prompt([
        { name: 'accountName', message: 'Digite o nome da conta que deseja ver o saldo:' }
    ])
    .then(answer => {
        const accountName = answer['accountName'];

        if (!validateAccountExists(accountName)) { return balance() };

        const accountData = getAccount(accountName);

        console.log(chalk.bgGreen.black(`O saldo da conta ${accountName} é R$${accountData.balance}`));

        operation();
    })
    .catch(error => console.log(error));
}

function deposit() {
    console.clear();
    inquirer.prompt([
        { name: 'accountName', message: 'Digite o nome da conta que deseja depositar:' }
    ])
    .then(answer => {
        const accountName = answer['accountName'];
        
        if (!validateAccountExists(accountName)) { return deposit() };

        inquirer.prompt([
            { name: 'depositValue', message: 'Digite o valor que deseja depositar:' }
        ]).then(answer => {

            const depositValue = answer['depositValue'];
            addAmount(accountName, depositValue);

        }).catch(error => console.log(error));
    })
    .catch(error => console.log(error));
}

function withdraw() {
    console.clear();
    inquirer.prompt([
        { name: 'accountName', message: 'Digite o nome da conta que deseja sacar:' }
    ])
    .then(answer => {
        const accountName = answer['accountName'];

        if (!validateAccountExists(accountName)) { return withdraw() };

        inquirer.prompt([
            { name: 'withdrawValue', message: 'Digite o valor que deseja sacar:' }
        ]).then(answer => {

            const withdrawValue = answer['withdrawValue'];
            removeAmount(accountName, withdrawValue);
            
        }).catch(error => console.log(error));

    })
    .catch(error => console.log(error));
}

function addAmount(accountName, amountValue) {
    const accountData = getAccount(accountName);

    if (!amountValue) {
        console.log(chalk.bgBlue.black('Ocorreu um erro, tente novamente mais tarde!'));
        return deposit();
    }

    accountData.balance = parseFloat(amountValue) + parseFloat(accountData.balance);

    fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), function(error) {
        console.log(error);
    });

    console.log(chalk.bgGreen.black(`Foi depositado o valor de R$${amountValue} na sua conta!`));
    operation();
}

function removeAmount(accountName, amountValue) {
    const accountData = getAccount(accountName);

    if (!amountValue) {
        console.log(chalk.bgBlue.black('Ocorreu um erro, tente novamente mais tarde!'));
        return withdraw();
    }

    if (amountValue > accountData.balance) {
        console.log(`[ERRO] SAQUE CANCELADO!!! Saldo Insuficiente:`);
    } else if (amountValue <= 0) {
        console.log(`[ERRO] SAQUE CANCELADO!!! Quantia do Saque invalida:`);
    } else {
        accountData.balance = parseFloat(accountData.balance) - parseFloat(amountValue);

        fs.writeFileSync(`accounts/${accountName}.json`, JSON.stringify(accountData), function(error) {
            console.log(error);
        });

        console.log(chalk.bgGreen.black(`Foi realizado um saque no valor de R$${amountValue} na sua conta!`));
    }
    operation();
}
