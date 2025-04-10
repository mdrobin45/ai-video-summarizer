"use client";
import { ai, processMarkdown } from "@/lib/utils";
import axios from "axios";
import {
   ChevronRight,
   FileText,
   Loader2,
   Sparkles,
   Youtube,
} from "lucide-react";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import "./style.css";

export default function Home() {
   const [url, setUrl] = useState<string>("");
   const [loading, setLoading] = useState<boolean>(false);
   const [summary, setSummary] = useState<string>("");
   const [videoId, setVideoId] = useState<string>("");

   // Function::Request: Get video ID from URL
   function extractVideoId(url: string): string | null {
      try {
         const parsedUrl = new URL(url);
         console.log(parsedUrl);
         if (parsedUrl.hostname === "youtu.be") {
            return parsedUrl.pathname.slice(1);
         }
         if (parsedUrl.searchParams.has("v")) {
            return parsedUrl.searchParams.get("v");
         }
      } catch {
         if (url.length === 11) return url;
      }

      return null;
   }

   // Function::Request: Get transcript from the server
   const getTranscript = async (id: string) => {
      try {
         const res = await axios.get("/api/transcript", {
            params: {
               video: id,
            },
         });
         return res?.data;
      } catch (error) {
         if (axios.isAxiosError(error) && error.response) {
            toast.error(error.response.data.error);
         }
      }
   };

   // Function::Request: Send request to Gemini
   const sendAiRequest = async (transcript: string) => {
      try {
         const res = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `You are a video summarizer assistant. Summarize the following video transcript under three headings: Summary, Highlights, and Key Insights.

Summary: A short paragraph describing the main idea and tone of the video.
Highlights: 5–8 important moments or points.
Key Insights:  5–7 deeper takeaways.
Response should be in Markdown format. Do not add <pre><code> tags. Do not add any other text or explanation.
Here is the transcript:
[${transcript}]`,
         });
         processMarkdown(res.text || "")
            .then((html) => {
               setSummary(html);
            })
            .catch((error) => {
               console.error("Error processing markdown:", error);
            });
      } catch (error) {
         console.error("Error sending AI request:", error);
      }
   };

   // Function: Handle form submission
   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      const videoId = extractVideoId(url);
      setVideoId(videoId as string);

      const transcript = await getTranscript(url);
      if (!transcript) {
         setLoading(false);
         return;
      }
      await sendAiRequest(transcript);
      setLoading(false);
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
         <div className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-center mb-12">
               <Youtube className="w-10 h-10 text-red-500 mr-3" />
               <h1 className="text-4xl font-bold">YouTube Video Summarizer</h1>
               <Sparkles className="w-6 h-6 text-yellow-400 ml-3" />
            </div>

            <div>
               <form onSubmit={handleSubmit} className="mb-8">
                  <div className="flex gap-4">
                     <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste YouTube video URL or ID here..."
                        className="flex-1 px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500 text-white placeholder-gray-400"
                     />
                     <button
                        type="submit"
                        disabled={loading || !url}
                        className="px-6 py-3 cursor-pointer bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        {loading ? (
                           <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Summarizing...
                           </>
                        ) : (
                           <>
                              Summarize
                              <ChevronRight className="w-5 h-5" />
                           </>
                        )}
                     </button>
                  </div>
               </form>

               {videoId && (
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                     <div className="aspect-video w-full bg-gray-800 rounded-xl overflow-hidden lg:sticky lg:top-10">
                        <iframe
                           src={`https://www.youtube.com/embed/${videoId}`}
                           title="YouTube video player"
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                           allowFullScreen
                           className="w-full h-full"
                        />
                     </div>

                     {!loading ? (
                        <div className="bg-gray-700 rounded-xl p-6 shadow-lg">
                           <div className="flex items-center gap-3 mb-4 text-blue-400 border-b border-gray-600 pb-4">
                              <FileText className="w-6 h-6" />
                              <h2 className="text-xl font-semibold">Summary</h2>
                           </div>

                           <div className="space-y-4">
                              <div
                                 dangerouslySetInnerHTML={{ __html: summary }}
                                 className="text-gray-200 leading-relaxed parseContent"></div>
                           </div>
                        </div>
                     ) : (
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mt-20" />
                     )}
                  </div>
               )}

               <div className="mt-8 text-center text-gray-400">
                  <p className="text-sm">
                     Developed by{" "}
                     <a className="text-blue-600" href="https://robinrana.com">
                        Robin Rana
                     </a>{" "}
                     • AI Powered Tool
                  </p>
               </div>
            </div>
         </div>
         <Toaster />
      </div>
   );
}
