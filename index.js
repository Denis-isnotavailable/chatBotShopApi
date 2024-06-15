require('dotenv').config();
const express = require('express');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TOKEN;
const webUrl = 'https://voluble-nougat-40fe46.netlify.app/';

const app = express();

app.use(express.json());
app.use(cors());

const bot = new TelegramBot(TOKEN, {polling: true});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Вітаю!', {
            reply_markup: {
                keyboard: [
                    [{text: 'Заповни форму', web_app: {url: webUrl + 'form'}}]
                ],
                resize_keyboard: true,
            }
        });

        await bot.sendMessage(chatId, 'Зробити замовлення', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Заповни форму', web_app: {url: webUrl + 'form'}}]
                ]
            }
        });
    }
    
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    if (msg?.web_app_data?.data) {        
        try {
            const data = JSON.parse(msg?.web_app_data?.data)
            console.log(data);

            await bot.sendMessage(chatId, "Дякуємо за зворотній зв'язок!")
            await bot.sendMessage(chatId, 'Ваша область: ' + data?.area);
            await bot.sendMessage(chatId, 'Ваше місто: ' + data?.city);
            await bot.sendMessage(chatId, 'Ваша адреса: ' + data?.address);
            await bot.sendMessage(chatId, 'Ваш номер тел.: ' + data?.phone);
            await bot.sendMessage(chatId, 'Ваш Email: ' + data?.email);

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Всю інформацію ви отримаєте за вказаними контактними даними');
            }, 3000)
        } catch (e) {
            console.log(e);
        }
    }
    
});

// "Не забудь заповнити форму зворотнього зв'язку в меню боту"


app.post('/web-data', async (req, res) => {
    const {queryId, products = [], totalPrice} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Вдала покупка',
            input_message_content: {
                message_text: ` Вітаю з покупкою, ви обрали товари на суму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
            }
        })
        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})

const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))