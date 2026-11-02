import { ImageDeleter } from "./image-deleter";
import { ImageUploader } from "./image-uploader";
import { GithubImageDeleter } from "./github-image-deleter";
import { GithubImageStorage, GithubImageStorageConfig } from "./github-image-storage";
import { GithubImageStorageError } from "./github-image-storage.error";

export function createImageUploader(env: Cloudflare.Env): ImageUploader {
  return new GithubImageStorage(getGithubConfig(env));
}

export function createImageDeleter(env: Cloudflare.Env): ImageDeleter {
  return new GithubImageDeleter(getGithubConfig(env));
}

function getGithubConfig(
  env: Cloudflare.Env & { GITHUB_TOKEN?: string }
): GithubImageStorageConfig {
  if (
    !env.GITHUB_TOKEN ||
    !env.GITHUB_OWNER ||
    env.GITHUB_OWNER.startsWith("YOUR_") ||
    !env.GITHUB_REPO ||
    env.GITHUB_REPO.startsWith("YOUR_") ||
    !env.GITHUB_BRANCH ||
    env.GITHUB_BRANCH.startsWith("YOUR_")
  ) {
    throw new GithubImageStorageError(
      "GitHub image storage is not configured.",
      500
    );
  }

  return {
    token: env.GITHUB_TOKEN,
    owner: env.GITHUB_OWNER,
    repo: env.GITHUB_REPO,
    branch: env.GITHUB_BRANCH,
  };
}