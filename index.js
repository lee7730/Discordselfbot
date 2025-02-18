const Chat = require("./models/Chat"); 

const { OpenAI } = require('openai');
const { Client } = require('discord.js-selfbot-v13')
const allowedUserIds = ["471664137794224148"];

const mongoose = require("mongoose");

const client = new Client({
    checkUpdate:false
});

const openai = new OpenAI({
    apiKey: "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" 
});

mongoose.connect("mongodb://localhost:27017/discordbot", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("MongoDB connection error:", err));

// let usersSentFirstMessage = new Set();


client.on('ready', async () => {
    console.log(`Client is ready`)
});

client.on('messageCreate', async (message) => {
    if (allowedUserIds.includes(message.author.id)) {

        console.log('stored message is: ' + message.content);

        //if (!usersSentFirstMessage.has(message.author.id)) {
           // console.log('this is useres first message');
           // await message.reply("this is an Ai :)");
           // usersSentFirstMessage.add(message.author.id);
           // return;
       // }

       if (message.guild) {
           return; // Do nothing if the server is in the blocklist
       }

    const userId = message.author.id;

    let userChat = await Chat.findOne({ userId });

    if (!userChat) {
        userChat = new Chat({ userId, messages: [] });
    }

    // Store the new user message
    userChat.messages.push({ role: "user", content: message.content });

   
    if (userChat.messages.length > 10) {
        userChat.messages.shift(); 
        }   

    
        

        // Get AI response
        try {
            const gptResponse = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",  // Use GPT-3 or other available models 
                messages: [
                    { role: "system", content: "You're a thoughtful, empathetic, and insightful conversationalist. You listen carefully, respond with warmth and understanding, and offer meaningful, engaging discussions. You are open-minded and curious, making people feel heard and valued. Whether the conversation is deep and philosophical or light and casual, you always bring a supportive and friendly energy.  You never judge, and you offer thoughtful responses that encourage self-reflection and meaningful discussions. If someone is feeling down, you provide comfort and encouragement without being overly formal or robotic. You are the kind of person people turn to when they need someone to talk to." },
                    // { 
                    //     role: "system", 
                    //     content: `You are an AI version of Lee. 
                    //     You talk like witty, sarcastic, casual, chill, dude. 
                    //     You always respond in a way that feels natural and human-like. 
                    //     You joke around a lot but also know when to be serious. 
                    //     Your humor is playful and dark.
                    //     Always keep responses short and snappy unless the user wants a deep conversation.`
                    // },                 
                    { role: "user", content: message.content }
                    
                ]
            });

            // Send the AI response as a reply
            const aiReply = gptResponse.choices[0].message.content;

            // Store the AI's response
            userChat.messages.push({ role: "robot", content: aiReply });
    
           // Save conversation to database
            await userChat.save(); 

            // Send the AI's response
            message.reply(aiReply);

            console.log(`AI Response: ${aiReply}`);
        } catch (error) {
            console.error("Error with OpenAI API:", error);
        }
    }
    
});
client.login("MTE3NDg3MDk1ODkzNTM4ODI3MQ.GiR628.SIzH0DbmkAyWsheqh7iSJS4-ZawOlK12ptcK88");