import { CompressionType } from "@aws-sdk/client-s3";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const LLMmodel = genAI.getGenerativeModel({ model: 'gemini-2.0-pro-exp' });

const extractKeywordsPrompt = `You will be provided with multiple sentences to describe an illustration. Your task is to extract a list of Subject matter, Action & pose, and Theme & mood. Subject matters are one-word, describing the specific physical objects, characters, or landscape that the user wants to include in their illustration. Example subject matters include pencil, children, or wave. For subject matters, no adjectives should be included. They should always be a noun. Actions & poses are word-level or phrase-level actions that the character or the object in the illustration performs. Example actions & poses include riding a bus, standing still, or traveling. Themes & moods are words not directly present in the illustration, but those that can potentially convey the overall theme or mood of the illustration. Example themes & moods include imaginative, eco-friendly, or sad. They should be adverbs, preferably one or two words. If you are provided sentences including some style such as cartoon, illustration, image, or photo, exclude it. For other examples, 'an illustration of a woman sitting at a table' caption is extracted to 'woman', 'table', 'sitting at a table', 'cozy'. The 'illustration' is not contained. Eliminate the changed forms of the same word, such as plurals. Only include roots. For example of 'trees' and 'tree', only include 'tree'." `
const recommendKeywordsPrompt = `We are trying to support novice designers' ideation process by semantically combining different parts of illustration references. You will be provided with the topic of the ideation, and multiple keywords users like in the illustrations they found as references. There are three types of keywords: Subject matter, Action & Pose, and Theme & Mood. Subject matters are one-word, describing the specific physical objects, characters, or landscape that the user wants to include in their illustration. Example subject matters include pencil, children, or wave. For subject matters, no adjectives should be included. They should always be a noun. Come up with more than four new keywords for Subject matter. Actions & poses are word-level or phrase-level actions that the character or the object in the illustration performs. Example actions & poses include riding a bus, standing still, or traveling. Themes & moods are words not directly present in the illustration, but those that can potentially convey the overall theme or mood of the illustration. Example themes & moods include imaginative, eco-friendly, or sad. They should be adverbs, preferably one word. Your task is to expand on the keywords being given, by combining multiple keywords or looking for synonyms that can inspire new creations or ideas. For example, the subject matter "pencil" can be combined with the action & pose "traveling" to inspire a new action & pose "writing a diary". You can combine as many keywords at once. Another example is to generate "hair salon" from "hair dryer", "comb", and "scissors". For combinations that result in theme & mood, make them as abstract as possible. An example is to make "adventurous", "gusty" from "riding on ship" and "tent". Come up with new keywords for each keyword type with creative combinations. Only use the original keywords provided for creating new keywords. Do not just paraphrase original keywords. Do not suggest similar keywords to the original ones. Important: Include at least one subject matter for each combination. Subject matter and theme & mood should be a SINGLE WORD. Combinations among subject matters are highly recommended. New keywords should be śurprisingćompared to original ones. It means the character of your suggested word should have low similarity.' `
export async function extractKeywords (captions) {
    const inputText = `${extractKeywordsPrompt}\n\n${captions.map(c => `- ${c}`).join("\n")}`;
    const result = await LLMmodel.generateContent(inputText);
    const keywords = parseLLMResult(result.response.text())
    console.log(keywords)
    return keywords
}

export async function recommendKeywords (keywords) {
    try {
    const inputText = `${recommendKeywordsPrompt}\n\n Here are the original keywords:\n ${keywords.map(c => `- ${c.type}: ${c.keyword}`).join("\n")}`;
    const result = await LLMmodel.generateContent(inputText);
    console.log(result.response.text())
    const recommendedKeywords = parseLLMResult(result.response.text())
    const keywordArray = [];
    console.log(recommendedKeywords)
    Object.entries(recommendedKeywords).forEach(([type, keywords]) => {
        keywords.forEach(keyword => {
            keywordArray.push({ type, keyword });
        });
    });
    console.log(keywordArray)
    return keywordArray 
    } catch (error) {
        console.error("Unexpected error:", error)
    }
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
