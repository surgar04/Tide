import { NextRequest, NextResponse } from "next/server";
import { github, OWNER, REPO } from "@/lib/github";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");

  if (!path) return new NextResponse("Missing path", { status: 400 });

  try {
    // Get the latest commit for this file to extract metadata (uploader, etc.)
    const { data: commits } = await github.rest.repos.listCommits({
      owner: OWNER,
      repo: REPO,
      path,
      per_page: 1,
    });

    if (!commits || commits.length === 0) {
      return NextResponse.json({ error: "No commits found" }, { status: 404 });
    }

    const lastCommit = commits[0];
    const message = lastCommit.commit.message;
    const date = lastCommit.commit.author?.date;

    // Parse metadata from commit message
    // Format: "uploader | category:type | filename | time"
    const parts = message.split('|').map(s => s.trim());
    
    let metadata = {
        uploader: "Unknown",
        category: "其他",
        type: "file",
        originalName: path.split('/').pop() || "",
        uploadTime: date
    };

    if (parts.length >= 3) {
        metadata.uploader = parts[0];
        
        const catType = parts[1].split(':');
        if (catType.length === 2) {
            metadata.category = catType[0];
            metadata.type = catType[1];
        } else {
            metadata.category = parts[1];
        }
        
        metadata.originalName = parts[2];
        if (parts[3]) metadata.uploadTime = parts[3];
    }

    return NextResponse.json({
      commit: {
        message,
        sha: lastCommit.sha,
        date: lastCommit.commit.author?.date,
      },
      metadata
    });
  } catch (error) {
    console.error("File details error:", error);
    return NextResponse.json({ error: "Failed to fetch details" }, { status: 500 });
  }
}
