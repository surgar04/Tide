import { Octokit } from "octokit";

// Initialize Octokit with the token from environment variables
// Note: This should only be used in server-side contexts to protect the token
export const github = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export const OWNER = "surgar04";
export const REPO = "Document-Repository";

// Helper to get file content or tree
export async function getRepoTree(path: string = "") {
  try {
    const { data } = await github.rest.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path,
    });
    return data;
  } catch (error) {
    console.error("Error fetching repo tree:", error);
    throw error;
  }
}

// Helper to get project folders (folders starting with "项目-")
export async function getProjects() {
  try {
    const { data } = await github.rest.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: "",
    });

    if (Array.isArray(data)) {
      return data
        .filter((item) => item.type === "dir" && item.name.startsWith("项目-"))
        .map((item) => item.name);
    }
    return [];
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function uploadFile(
  path: string,
  content: string | Buffer, // Base64 encoded content
  message: string,
  branch: string = "main",
  owner: string = OWNER,
  repo: string = REPO
) {
  try {
    // Check if file exists to get SHA (for update)
    let sha: string | undefined;
    try {
      const { data } = await github.rest.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });
      if (!Array.isArray(data) && data.sha) {
        sha = data.sha;
      }
    } catch (e) {
      // File doesn't exist, which is fine
    }

    const { data } = await github.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: typeof content === 'string' ? content : content.toString('base64'),
      sha,
      branch,
    });
    return data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

export async function checkHealth() {
  try {
    const { headers } = await github.rest.rateLimit.get();
    return {
      status: "ok",
      limit: headers["x-ratelimit-limit"],
      remaining: headers["x-ratelimit-remaining"],
      reset: headers["x-ratelimit-reset"],
    };
  } catch (error) {
    return { status: "error", error };
  }
}
