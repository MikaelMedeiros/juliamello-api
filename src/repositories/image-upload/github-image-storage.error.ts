export class GithubImageStorageError extends Error {
  readonly expose = true;

  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "GithubImageStorageError";
  }
}

export function getGithubStatus(error: unknown): number | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }

  return undefined;
}

export function toGithubImageStorageError(
  error: unknown
): GithubImageStorageError {
  const status = getGithubStatus(error);

  if (status === 401) {
    return new GithubImageStorageError(
      "GitHub authentication failed.",
      502
    );
  }

  if (status === 403) {
    return new GithubImageStorageError(
      "GitHub denied access to the image repository.",
      502
    );
  }

  if (status === 404) {
    return new GithubImageStorageError(
      "GitHub image repository or branch was not found.",
      502
    );
  }

  if (status === 409 || status === 422) {
    return new GithubImageStorageError(
      "GitHub could not update the image because the file changed.",
      409
    );
  }

  return new GithubImageStorageError(
    "GitHub image storage request failed.",
    502
  );
}