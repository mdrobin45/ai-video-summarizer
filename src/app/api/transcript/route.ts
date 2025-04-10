import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

function extractVideoId(url: string): string | null {
   try {
      const parsedUrl = new URL(url);
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
export async function GET(req: NextRequest) {
   try {
      const query = req.nextUrl.searchParams;
      const video = query.get("video");
      const videoId = extractVideoId(video as string);
      if (!videoId) {
         return NextResponse.json(
            { error: "Invalid video URL or ID." },
            { status: 400 }
         );
      }

      let transcript = "";
      try {
         const call = await YoutubeTranscript.fetchTranscript(videoId);

         call.map((line) => {
            transcript += line.text;
         });
      } catch (error) {
         console.error("Error fetching transcript:", error);
         return NextResponse.json(
            { error: "Transcript is disabled for this video." },
            { status: 403 }
         );
      }

      return NextResponse.json(transcript);
   } catch {
      return NextResponse.json(
         { error: "Internal Server Error" },
         { status: 500 }
      );
   }
}
