import { GoogleGenAI } from "@google/genai";
import { remark } from "remark";
import html from "remark-html";

// Gemini model instance
export const ai = new GoogleGenAI({
   apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
});

// Function:: Process markdown
export const processMarkdown = async (markdown: string) => {
   markdown = markdown.replace(/^```markdown\s*/, "").replace(/\s*```$/, "");
   const processContent = await remark().use(html).process(markdown);
   const htmlContent = processContent.toString();
   return htmlContent;
};
