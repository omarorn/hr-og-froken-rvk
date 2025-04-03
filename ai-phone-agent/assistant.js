const { OpenAI } = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function askAssistant(prompt) {
    const chatCompletion = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: [
            {
                role: "system",
                content: "Þú ert vinalegur og snjall íslenskur síma-aðstoðarmaður."
            },
            {
                role: "user",
                content: prompt
            }
        ]
    });

    return chatCompletion.choices[0].message.content;
}

module.exports = askAssistant;
