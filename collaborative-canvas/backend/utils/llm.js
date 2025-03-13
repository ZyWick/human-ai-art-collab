import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const LLMmodel = genAI.getGenerativeModel({ model: 'gemini-2.0-pro-exp' });

const extractKeywordsPrompt = `You will be provided with multiple sentences to describe an illustration. Your task is to extract a list of Subject matter, Action & pose, and Theme & mood. Subject matters are one-word, describing the specific physical objects, characters, or landscape that the user wants to include in their illustration. Example subject matters include pencil, children, or wave. For subject matters, no adjectives should be included. They should always be a noun. Actions & poses are word-level or phrase-level actions that the character or the object in the illustration performs. Example actions & poses include riding a bus, standing still, or traveling. Themes & moods are words not directly present in the illustration, but those that can potentially convey the overall theme or mood of the illustration. Example themes & moods include imaginative, eco-friendly, or sad. They should be adverbs, preferably one or two words. If you are provided sentences including some style such as cartoon, illustration, image, or photo, exclude it. For other examples, 'an illustration of a woman sitting at a table' caption is extracted to 'woman', 'table', 'sitting at a table', 'cozy'. The 'illustration' is not contained. Eliminate the changed forms of the same word, such as plurals. Only include roots. For example of 'trees' and 'tree', only include 'tree'." `

export async function extractKeywords (captions) {
    const inputText = `${extractKeywordsPrompt}\n\n${captions.map(c => `- ${c}`).join("\n")}`;
    const result = await LLMmodel.generateContent(inputText);
    console.log(result.response.text())
    const keywords = parseLLMResult(result.response.text())
    console.log(keywords)
    return keywords
}

function parseLLMResult(llmResult) {
    const result = {
        "Subject matter": new Set(),
        "Action & pose": new Set(),
        "Theme & mood": new Set()
    };

    // Improved regex patterns with better flexibility
    const subjectRegex = /\*\*\s*Subject Matter:\s*\*\*\s*([^\n]+)/gi;
    const actionRegex = /\*\*\s*Action & Pose:\s*\*\*\s*([^\n]+)/gi;
    const themeRegex = /\*\*\s*Theme & Mood:\s*\*\*\s*([^\n]+)/gi;

    let match;

    while ((match = subjectRegex.exec(llmResult)) !== null) {
        match[1].split(',').map(s => result["Subject matter"].add(s.trim()));
    }

    while ((match = actionRegex.exec(llmResult)) !== null) {
        if (match[1] && !match[1].toLowerCase().includes("none explicitly stated")) {
            match[1].replace(/\(.*?\)/g, '').split(',')
                .map(s => result["Action & pose"].add(s.trim()));
        }
    }

    while ((match = themeRegex.exec(llmResult)) !== null) {
        if (match[1] && !match[1].toLowerCase().includes("none explicitly stated")) {
            match[1].replace(/\(.*?\)/g, '').split(',')
                .map(s => result["Theme & mood"].add(s.trim()));
        }
    }

    return {
        "Subject matter": Array.from(result["Subject matter"]),
        "Action & pose": Array.from(result["Action & pose"]),
        "Theme & mood": Array.from(result["Theme & mood"])
    };
}
