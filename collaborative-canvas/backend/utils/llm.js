import { CompressionType } from "@aws-sdk/client-s3";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const LLMmodel = genAI.getGenerativeModel({ model: 'gemini-2.0-pro-exp' });
const OPENAIMODEL = "gpt-4.1-2025-04-14"
const extractKeywordsPrompt = `You will be provided with multiple sentences to describe an illustration. Your task is to extract a list of Subject matter, Action & pose, and Theme & mood. Subject matters are one-word, describing the specific physical objects, characters, or landscape that the user wants to include in their illustration. Example subject matters include pencil, children, or wave. For subject matters, no adjectives should be included. They should always be a noun. Actions & poses are word-level or phrase-level actions that the character or the object in the illustration performs. Example actions & poses include riding a bus, standing still, or traveling. Themes & moods are words not directly present in the illustration, but those that can potentially convey the overall theme or mood of the illustration. Example themes & moods include imaginative, eco-friendly, or sad. They should be adverbs, preferably one or two words. If you are provided sentences including some style such as cartoon, illustration, image, or photo, exclude it. For other examples, 'an illustration of a woman sitting at a table' caption is extracted to 'woman', 'table', 'sitting at a table', 'cozy'. The 'illustration' is not contained. Eliminate the changed forms of the same word, such as plurals. Only include roots. For example of 'trees' and 'tree', only include 'tree'." `
const recommendKeywordsPrompt = `We are trying to support novice designers' ideation process by semantically combining different parts of illustration references. You will be provided with the topic of the ideation, and multiple keywords users like in the illustrations they found as references. There are three types of keywords: Subject matter, Action & Pose, and Theme & Mood. Subject matters are one-word, describing the specific physical objects, characters, or landscape that the user wants to include in their illustration. Example subject matters include pencil, children, or wave. For subject matters, no adjectives should be included. They should always be a noun. Come up with more than four new keywords for Subject matter. Actions & poses are word-level or phrase-level actions that the character or the object in the illustration performs. Example actions & poses include riding a bus, standing still, or traveling. Themes & moods are words not directly present in the illustration, but those that can potentially convey the overall theme or mood of the illustration. Example themes & moods include imaginative, eco-friendly, or sad. They should be adverbs, preferably one word. Your task is to expand on the keywords being given, by combining multiple keywords or looking for synonyms that can inspire new creations or ideas. For example, the subject matter "pencil" can be combined with the action & pose "traveling" to inspire a new action & pose "writing a diary". You can combine as many keywords at once. Another example is to generate "hair salon" from "hair dryer", "comb", and "scissors". For combinations that result in theme & mood, make them as abstract as possible. An example is to make "adventurous", "gusty" from "riding on ship" and "tent". Come up with new keywords for each keyword type with creative combinations. Only use the original keywords provided for creating new keywords. Do not just paraphrase original keywords. Do not suggest similar keywords to the original ones. Important: Include at least one subject matter for each combination. Subject matter and theme & mood should be a SINGLE WORD. Combinations among subject matters are highly recommended. New keywords should be śurprisingćompared to original ones. It means the character of your suggested word should have low similarity.' `


import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function extractKeywords (captions) {
    const response = await openai.responses.create({
      model: OPENAIMODEL,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "Extract key elements from descriptive sentences of illustrations for categorization into three areas: \"Subject matter,\" \"Action & pose,\" and \"Theme & mood.\"\n\n- **Subject matter**: Extract specific, visually identifiable nouns or noun phrases, including compound objects and descriptive pairings (e.g., “colorful objects,” “red and orange background”). Favor phrases over single-word nouns when appropriate. Avoid reducing meaningful descriptors to general nouns.\n\n- **Action & pose**: Identify any clearly implied actions or poses performed by subjects. Use the base form (e.g., “reading,” “riding”) or descriptive phrases. If no actions are present, list should be empty.\n\n- **Theme & mood**: Use adjectives, abstract nouns, or adverbs that capture the overall emotion, setting, purpose, or cultural context. Favor concise, meaningful words and omit style terms.\n\nExclude variations like plurals and style descriptors (e.g., cartoon, illustration). Use root forms of words only.\n\n# Steps\n\n1. Review the provided sentences or descriptions.\n2. Extract nouns for \"Subject matter.\"\n3. Determine actions or poses for \"Action & pose.\"\n4. Choose relevant adjectives or adverbs for \"Theme & mood.\"\n5. Eliminate style descriptors and apply root forms where necessary.\n\n# Output Format\n\nStructure the output as a JSON object with distinct keys for each category: \"Subject matter,\" \"Action & pose,\" and \"Theme & mood.\"\n\n# Examples\n\n**User Input:**  \n```json\n{\n  \"Caption\": [\n    \"An old man is reading a book at a kitchen table.\",\n    \"Mountains are covered in snow under a cloudy sky.\",\n    \"A dog is lying casually beside a fireplace.\"\n  ]\n}\n```\n\n**Assistant Output:**  \n```json\n{\n  \"Subject matter\": [\"old man\", \"book\", \"kitchen table\", \"mountains\", \"snow\", \"cloudy sky\", \"dog\", \"rug\", \"fireplace\"],\n  \"Action & pose\": [\"reading a book\", \"lying casually\"],\n  \"Theme & mood\": [\"cozy\", \"serene\"]\n}\n```\n\n**User Input:**  \n```json\n{\n  \"Caption\": [\n    \"A firefighter sprays water on a burning house.\",\n    \"A crowd watches a parade from the sidewalk.\",\n    \"A boy rides a bicycle through the rain.\"\n  ]\n}\n```\n\n**Assistant Output:**  \n```json\n{\n  \"Subject matter\": [\"firefighter\", \"water\", \"burning house\", \"crowd\", \"parade\", \"sidewalk\", \"boy\", \"bicycle\", \"rain\"],\n  \"Action & pose\": [\"spraying water\", \"watching a parade\", \"riding a bicycle\"],\n  \"Theme & mood\": [\"urgent\", \"lively\", \"adventurous\"]\n}\n```\n\n**User Input:**  \n```json\n{\n  \"Caption\": [\n    \"A painting of a stone cottage surrounded by lavender fields.\",\n    \"An image of a lighthouse on a cliff overlooking the sea.\",\n    \"A sketch of a bridge crossing a quiet river in autumn.\",\n    \"A photo of a barn with haystacks nearby under a cloudy sky.\"\n  ]\n}\n```\n**Assistant Output:**  \n```json\n{\n  \"Subject matter\": [\"stone cottage\", \"lavender fields\", \"lighthouse\", \"cliff\", \"sea\", \"bridge\", \"river\", \"autumn\", \"barn\", \"haystacks\", \"sky\"],\n  \"Action & pose\": [],\n  \"Theme & mood\": [\"serene\", \"rural\", \"natural\"]\n}\n```\n\n# Notes\n\n- Focus on visible elements and actions, especially in sentences with abstract descriptors that may not directly map to visible objects or actions."
        }
          ]
        },
        {
          role: "user",
          content: captions
        }
      ],
      text: {
        format: {
          type: "json_object"
        }
      },
      temperature: 1,
      max_output_tokens: 2048,
      top_p: 1,
      store: true
    });

    return JSON.parse(response.output_text);;
}

export async function recommendKeywords (data) {
     const response = await openai.responses.create({
      model: OPENAIMODEL,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "You are assisting novice designers in generating fresh and unexpected ideas for illustrations by creatively expanding user-provided keywords, inspired by a design brief.\n\nYou will be provided with:\n\n1. Three vote-weighted keyword lists (each item = { term: integer }):\n   - **Subject matter**: Specific nouns or noun phrases, including compound objects and descriptive pairings..\n   - **Action & pose**: Clearly implied actions or poses. Use the base form or descriptive phrases. \n   - **Theme & mood**: Adjectives or abstract nouns capturing emotion, setting, or cultural context. \n\n2. **Design Brief (string)**: A free-form text description of the overall illustration intent, use-case, or style.\n\n# Steps\n\n1. **Review Input**: Analyze the design brief and keyword lists.\n2. **Keyword Expansion**:\n   - Prioritize high-vote-weight terms.\n   - Creatively expand keywords by combining elements.\n   - Ensure new results are creative and different from originals.\n   - Include at least one Subject matter in each combination.\n   - Avoid simple rewordings or near-synonyms.\n   - Exclude variations like plurals and style descriptors (e.g., cartoon, illustration). \n   - Use root forms of words only.\n3. **Organize by Category**: Classify expanded keywords under \"Subject matter,\" \"Action & pose,\" and \"Theme & mood.\"\n\n# Output Format\n\nThe output should be a structured JSON object with keys for each category: \"Subject matter,\" \"Action & pose,\" and \"Theme & mood.\"\n\n# Examples\n\n**User Input:**  \n```json\n{\n  \"Subject matter\": {\n    \"robot\": 5,\n    \"abandoned city\": 4,\n    \"overgrown ruins\": 3,\n    \"satellite\": 2\n  },\n  \"Action & pose\": {\n    \"scanning\": 4,\n    \"walking\": 3,\n    \"repairing\": 2\n  },\n  \"Theme & mood\": {\n    \"melancholic\": 4,\n    \"mysterious\": 3,\n    \"hopeful\": 2\n  },\n  \"Brief\": \"A post-apocalyptic AI character wandering a lost city searching for signs of life.\"\n}\n```\n\n**Assistant Output:**  \n```json\n{\n  \"Subject matter\": [\n    \"plaza\",\n    \"power hub\",\n    \"vine-wrapped android\",\n    \"obelisk\"\n  ],\n  \"Action & pose\": [\n    \"kneeling\",\n    \"gently uncovering rubble\",\n    \"raising an antenna\"\n  ],\n  \"Theme & mood\": [\n    \"reverent\",\n    \"aching solitude\",\n    \"flickers of wonder\",\n    \"timeless curiosity\"\n  ]\n}\n```\n\n**User Input:**  \n```json\n{\n  \"Subject matter\": {\n    \"witch\": 5,\n    \"library\": 4,\n    \"books\": 3,\n    \"candles\": 2\n  },\n  \"Action & pose\": {\n    \"reading\": 4,\n    \"floating\": 3,\n    \"casting a spell\": 2\n  },\n  \"Theme & mood\": {\n    \"mystical\": 5,\n    \"dark\": 3,\n    \"cozy\": 2\n  },\n  \"Brief\": \"A magical study where a young witch explores forbidden knowledge in a floating library of shadows.\"\n}\n```\n\n**Assistant Output:**  \n```json\n{\n  \"Subject matter\": [\n    \"grimoire\",\n    \"candelabra\",\n    \"ink-drenched shadows\",\n    \"spellroom\"\n  ],\n  \"Action & pose\": [\n    \"gazing\",\n    \"hovering\",\n    \"summoning memories\"\n  ],\n  \"Theme & mood\": [\n    \"dread\",\n    \"hidden warmth\",\n    \"arcane\",\n    \"eerie intimacy\"\n  ]\n}\n```\n\n**User Input:**  \n```json\n{\n  \"Subject matter\": {\n    \"pirate ship\": 5,\n    \"kraken\": 4,\n    \"treasure chest\": 3,\n    \"foggy ocean\": 2\n  },\n  \"Action & pose\": {\n    \"battling\": 5,\n    \"climbing\": 3,\n    \"escaping\": 2\n  },\n  \"Theme & mood\": {\n    \"epic\": 4,\n    \"tense\": 3,\n    \"swashbuckling\": 2\n  },\n  \"Brief\": \"A cinematic sea battle where a pirate crew defends its treasure from a mythic sea monster in heavy fog.\"\n}\n```\n\n**Assistant Output:**  \n```json\n{\n  \"Subject matter\": [\n    \"mast graveyard\",\n    \"crow’s nest\",\n    \"glimmering vault\",\n    \"ghost-lantern fleet\"\n  ],\n  \"Action & pose\": [\n    \"leaping between sails\",\n    \"swinging a flaming chain\",\n    \"ripping open\"\n  ],\n  \"Theme & mood\": [\n    \"valor\",\n    \"haunted glory\",\n    \"desperation\",\n    \"reckless defiance\"\n  ]\n}\n```\n\n# Notes\n\n- Combine or remix at least two original keywords for each new keyword.\n- Emphasize boldness and novelty over similarity.\n- Ensure keywords are derived from original input without external information.\n\n\n"
        }
          ]
        },
        {
          role: "user",
          content: data
        }
      ],
      text: {
        format: {
          type: "json_object"
        }
      },
      temperature: 1,
      max_output_tokens: 2048,
      top_p: 1,
      store: true
    });

    return JSON.parse(response.output_text);;
}
