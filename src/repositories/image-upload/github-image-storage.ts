import { imageSize } from "image-size";
import { Octokit } from "octokit";
import { ImageStorageResult } from "./model/image-storage-result.model";
import { ImageUploadOptions } from "./model/image-upload-options.model";
import { ImageUploader } from "./image-uploader";
import {
  getGithubStatus,
  GithubImageStorageError,
  toGithubImageStorageError,
} from "./github-image-storage.error";

export interface GithubImageStorageConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const REPOSITORY_IMAGE_ROOT = "public";

const FILE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

export class GithubImageStorage implements ImageUploader {
  constructor(
    private readonly config: GithubImageStorageConfig,
    private readonly octokit: Octokit = new Octokit({
      auth: config.token,
    })
  ) {}

  async upload(
    file: File,
    options: ImageUploadOptions
  ): Promise<ImageStorageResult> {
    if (file.size === 0 || file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new GithubImageStorageError(
        "Image must be between 1 byte and 5 MiB.",
        file.size > MAX_IMAGE_SIZE_BYTES ? 413 : 400
      );
    }

    const extension = FILE_EXTENSIONS[file.type];

    if (!extension) {
      throw new GithubImageStorageError(
        "Image content type is not supported.",
        400
      );
    }

    const path = createRepositoryPath(options, extension);
    const bytes = new Uint8Array(await file.arrayBuffer());
    let dimensions: ReturnType<typeof imageSize>;

    try {
      dimensions = imageSize(bytes);
    } catch {
      throw new GithubImageStorageError(
        "Image content could not be read.",
        400
      );
    }

    let existingSha: string | undefined;

    try {
      const existing = await this.octokit.rest.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        ref: this.config.branch,
      });

      if (!Array.isArray(existing.data) && "sha" in existing.data) {
        existingSha = existing.data.sha;
      }
    } catch (error) {
      if (getGithubStatus(error) !== 404) {
        throw toGithubImageStorageError(error);
      }
    }

    let response;

    try {
      response = await this.octokit.rest.repos.createOrUpdateFileContents({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        message: `Upload image ${path}`,
        content: bytesToBase64(bytes),
        branch: this.config.branch,
        ...(existingSha ? { sha: existingSha } : {}),
      });
    } catch (error) {
      throw toGithubImageStorageError(error);
    }

    const commitSha = response.data.commit.sha;

    if (!commitSha) {
      throw new GithubImageStorageError(
        "GitHub did not return image commit metadata.",
        502
      );
    }

    const url = createPublicUrl(
      this.config,
      commitSha,
      path,
    );

    return {
      key: path,
      url,
      width: dimensions.width,
      height: dimensions.height,
    };
  }
}

function createRepositoryPath(
  options: ImageUploadOptions,
  extension: string
): string {
  const folderSegments = options.folder.split("/");

  if (
    folderSegments.length === 0 ||
    folderSegments.some(segment => !isSafePathSegment(segment)) ||
    !isSafePathSegment(options.publicId)
  ) {
    throw new GithubImageStorageError(
      "Image path is invalid.",
      400
    );
  }

  return `${REPOSITORY_IMAGE_ROOT}/${folderSegments.join("/")}/${options.publicId}.${extension}`;
}

function isSafePathSegment(segment: string): boolean {
  return (
    segment !== "." &&
    segment !== ".." &&
    /^[a-zA-Z0-9._-]+$/.test(segment)
  );
}

function bytesToBase64(bytes: Uint8Array): string {
  const chunkSize = 0x8000;
  let binary = "";

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function createPublicUrl(
  config: GithubImageStorageConfig,
  commitSha: string,
  path: string
): string {
  const encodedPath = path
    .split("/")
    .map(segment => encodeURIComponent(segment))
    .join("/");

  return `https://raw.githubusercontent.com/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/${encodeURIComponent(commitSha)}/${encodedPath}`;
}