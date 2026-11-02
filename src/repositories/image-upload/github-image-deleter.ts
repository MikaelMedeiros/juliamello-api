import { Octokit } from "octokit";
import { ImageDeleter } from "./image-deleter";
import {
  getGithubStatus,
  GithubImageStorageError,
  toGithubImageStorageError,
} from "./github-image-storage.error";
import { GithubImageStorageConfig } from "./github-image-storage";

const LEGACY_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "heic", "heif"];

export class GithubImageDeleter implements ImageDeleter {
  constructor(
    private readonly config: GithubImageStorageConfig,
    private readonly octokit: Octokit = new Octokit({
      auth: config.token,
    })
  ) {}

  async delete(key: string): Promise<void> {
    let existingFile: { path: string; sha: string } | undefined;

    for (const path of getRepositoryPathCandidates(key)) {
      try {
        const response = await this.octokit.rest.repos.getContent({
          owner: this.config.owner,
          repo: this.config.repo,
          path,
          ref: this.config.branch,
        });

        if (
          Array.isArray(response.data) ||
          !("sha" in response.data) ||
          !/^[a-f0-9]{40}$/i.test(response.data.sha)
        ) {
          throw new GithubImageStorageError(
            "GitHub returned invalid image file metadata.",
            502
          );
        }

        existingFile = { path, sha: response.data.sha };
        break;
      } catch (error) {
        if (getGithubStatus(error) === 404) {
          continue;
        }

        if (error instanceof GithubImageStorageError) {
          throw error;
        }

        throw toGithubImageStorageError(error);
      }
    }

    if (!existingFile) {
      return;
    }

    try {
      await this.octokit.rest.repos.deleteFile({
        owner: this.config.owner,
        repo: this.config.repo,
        path: existingFile.path,
        message: `Delete image ${existingFile.path}`,
        sha: existingFile.sha,
        branch: this.config.branch,
      });
    } catch (error) {
      if (getGithubStatus(error) !== 404) {
        throw toGithubImageStorageError(error);
      }
    }
  }
}

function getRepositoryPathCandidates(key: string): string[] {
  const segments = key.split("/");

  if (
    segments.length < 2 ||
    segments.some(segment =>
      segment === "." ||
      segment === ".." ||
      !/^[a-zA-Z0-9._-]+$/.test(segment)
    )
  ) {
    throw new GithubImageStorageError(
      "Image key is outside the permitted public folder.",
      400
    );
  }

  if (segments[0] === "public") {
    return [key];
  }

  const legacyPath = `public/${key}`;

  if (/\.(jpg|jpeg|png|webp|heic|heif)$/i.test(segments[segments.length - 1])) {
    return [legacyPath];
  }

  return LEGACY_IMAGE_EXTENSIONS.map(extension =>
    `${legacyPath}.${extension}`
  );
}