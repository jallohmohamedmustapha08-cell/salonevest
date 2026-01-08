import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyAcGBiN0BJV0BO5CMGWMOm9RzeJFufnW7c"; // Hardcoded for test only
const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = "Reply with 'Hello, World!' if you can hear me.";

        console.log("Sending request to Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Success! Response:", text);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

run();
