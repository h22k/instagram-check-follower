const Telebot: any = require('telebot');

const {
    BOT_TOKEN,
    TELEGRAM_USER
} = process.env

const bot: any = new Telebot(BOT_TOKEN)

const sendMessage = (msg: string): null => {
    return bot.sendMessage(TELEGRAM_USER, msg, {
        parseMode: 'html'
    })
}

const sayHiMessage = (fullName: string): null => {
    return sendMessage(`Hi ${fullName} 😻, I will be quick.`)
}

export {
    sendMessage,
    sayHiMessage
}