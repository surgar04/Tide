import { NextResponse } from "next/server";
import { getProjects, getRepoTree, OWNER, REPO, github } from "@/lib/github";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path") || "";
    const type = searchParams.get("type"); // 'projects' or 'all'

    if (type === "projects") {
      const projects = await getProjects();
      return NextResponse.json({ projects });
    }

    // Fetch all resources recursively
    // Note: Recursive fetch might hit rate limits or be slow for large repos. 
    // Using the Tree API is better for deep fetching.
    try {
        // Get the default branch first
        const { data: repoData } = await github.rest.repos.get({
            owner: OWNER,
            repo: REPO,
        });
        const branch = repoData.default_branch;

        const { data: treeData } = await github.rest.git.getTree({
            owner: OWNER,
            repo: REPO,
            tree_sha: branch,
            recursive: "true",
        });

        // Filter for files, and parse metadata if possible
        // Since we can't easily get commit messages for all files in one go without N+1,
        // we will return the file list and basic info. 
        // The client might need to fetch details for specific items or we accept limited info.
        // However, the requirements say "Category by reading upload info...". 
        // If we can't get commit message efficiently, we might fallback to path/type.
        // Let's return the tree for now.
        
        const resources = treeData.tree.filter(item => item.type === "blob").map(item => {
            // Try to extract project from path
            const pathParts = item.path?.split('/') || [];
            let project = "未分配";
            if (pathParts[0].startsWith("项目-")) {
                project = pathParts[0];
            }

            // Mocking other metadata from path/ext for list view speed
            // Real commit message fetching would be done in a separate 'details' call or batched if critical.
            return {
                id: item.sha,
                title: pathParts[pathParts.length - 1],
                path: item.path,
                size: item.size,
                project,
                url: item.url, // This is API URL
                type: "file"
            };
        });

        return NextResponse.json({ resources });

    } catch (e) {
        console.error("Tree fetch failed", e);
        return NextResponse.json({ error: "Failed to fetch tree" }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
