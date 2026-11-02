import { describe, expect, it, vi } from "vitest";
import { Octokit } from "octokit";
import { handleError } from "../src/exceptions/erro.handler";
import { GithubImageStorage } from "../src/repositories/image-upload/github-image-storage";
import { GithubImageDeleter } from "../src/repositories/image-upload/github-image-deleter";
import { GithubImageStorageError } from "../src/repositories/image-upload/github-image-storage.error";

const config = {
  token: "test-token",
  owner: "site-owner",
  repo: "site-content",
  branch: "main",
};

const pngBytes = Uint8Array.from(
  atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/jXcAAAAASUVORK5CYII="),
  character => character.charCodeAt(0)
);

const jpgBytes = new Uint8Array([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00,
  0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xc0,
  0x00, 0x11, 0x08, 0x00, 0x01, 0x00, 0x01, 0x03, 0x01, 0x11, 0x00,
  0x02, 0x11, 0x00, 0x03, 0x11, 0x00, 0xff, 0xd9,
]);

function createFile(bytes: Uint8Array, name: string, type: string): File {
  return new File([bytes], name, { type });
}

function createOctokit(fetch: typeof globalThis.fetch): Octokit {
  return new Octokit({
    auth: config.token,
    request: { fetch, retries: 0 },
  });
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("GithubImageStorage", () => {
  it.each([
    ["PNG", pngBytes, "image/png", "slot-01.png"],
    ["JPG", jpgBytes, "image/jpeg", "slot-01.jpg"],
  ])("uploads %s into the public folder", async (_label, bytes, type, filename) => {
    const fetch = vi.fn<typeof globalThis.fetch>(async (input, init) => {
      const method = init?.method ?? "GET";

      if (method === "GET") {
        return jsonResponse({ message: "Not Found" }, 404);
      }

      return jsonResponse({
        content: { path: `public/org/portfolio/${filename}`, sha: "blob-sha" },
        commit: { sha: "commit-sha" },
      }, 201);
    });
    const storage = new GithubImageStorage(config, createOctokit(fetch));

    const result = await storage.upload(
      createFile(bytes, "original-name", type),
      { folder: "org/portfolio", publicId: "slot-01" }
    );

    expect(result).toEqual({
      key: `public/org/portfolio/${filename}`,
      url: `https://raw.githubusercontent.com/site-owner/site-content/commit-sha/public/org/portfolio/${filename}`,
      width: 1,
      height: 1,
    });

    const putRequest = fetch.mock.calls.find(([, init]) => init?.method === "PUT");
    expect(putRequest).toBeDefined();
    const payload = JSON.parse(String(putRequest?.[1]?.body));
    expect(payload.content).toBe(btoa(String.fromCharCode(...bytes)));
    expect(payload.branch).toBe("main");
    expect(payload.sha).toBeUndefined();
  });

  it("uses the existing file SHA when replacing a slot", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async (_input, init) => {
      if (init?.method === "GET") {
        return jsonResponse({ type: "file", sha: "existing-sha" });
      }

      return jsonResponse({ commit: { sha: "new-commit" } });
    });
    const storage = new GithubImageStorage(config, createOctokit(fetch));

    await storage.upload(
      createFile(pngBytes, "replacement.png", "image/png"),
      { folder: "org/about", publicId: "about" }
    );

    const putRequest = fetch.mock.calls.find(([, init]) => init?.method === "PUT");
    expect(JSON.parse(String(putRequest?.[1]?.body)).sha).toBe("existing-sha");
  });

  it("ignores an untrusted original filename", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async (_input, init) =>
      init?.method === "GET"
        ? jsonResponse({ message: "Not Found" }, 404)
        : jsonResponse({ commit: { sha: "commit-sha" } }, 201)
    );
    const storage = new GithubImageStorage(config, createOctokit(fetch));

    const result = await storage.upload(
      createFile(pngBytes, "../../secret.png", "image/png"),
      { folder: "org/portfolio", publicId: "slot-01" }
    );

    expect(result.key).toBe("public/org/portfolio/slot-01.png");
  });

  it("rejects unsafe folder paths and files over the upload limit", async () => {
    const storage = new GithubImageStorage(config);

    await expect(
      storage.upload(createFile(pngBytes, "x.png", "image/png"), {
        folder: "../outside",
        publicId: "slot-01",
      })
    ).rejects.toMatchObject({ status: 400 });

    await expect(
      storage.upload(
        createFile(new Uint8Array(5 * 1024 * 1024 + 1), "large.png", "image/png"),
        { folder: "org", publicId: "banner" }
      )
    ).rejects.toMatchObject({ status: 413 });
  });

  it.each([
    [401, "GitHub authentication failed."],
    [403, "GitHub denied access to the image repository."],
  ])("sanitizes GitHub status %s without exposing request details", async (status, message) => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () =>
      jsonResponse({ message: "private response" }, status)
    );
    const storage = new GithubImageStorage(config, createOctokit(fetch));

    await expect(
      storage.upload(
        createFile(pngBytes, "image.png", "image/png"),
        { folder: "org", publicId: "banner" }
      )
    ).rejects.toBeInstanceOf(GithubImageStorageError);

    await expect(
      storage.upload(
        createFile(pngBytes, "image.png", "image/png"),
        { folder: "org", publicId: "banner" }
      )
    ).rejects.toMatchObject({ message, status: 502 });
  });

  it("sanitizes network failures", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () => {
      throw new Error("network detail containing test-token");
    });
    const storage = new GithubImageStorage(config, createOctokit(fetch));

    await expect(
      storage.upload(
        createFile(pngBytes, "image.png", "image/png"),
        { folder: "org", publicId: "banner" }
      )
    ).rejects.toMatchObject({
      message: "GitHub image storage request failed.",
      status: 502,
    });
  });

  it("returns the sanitized provider status through the HTTP error handler", async () => {
    const response = handleError(
      new GithubImageStorageError("GitHub image storage request failed.", 502),
      {}
    );

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: "GitHub image storage request failed.",
    });
  });
});

describe("GithubImageDeleter", () => {
  const key = "public/org/portfolio/slot-01.png";
  const validSha = "a".repeat(40);

  it("deletes an existing image using its SHA and configured branch", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async (_input, init) =>
      init?.method === "GET"
        ? jsonResponse({ type: "file", sha: validSha })
        : jsonResponse({ commit: { sha: "deleted-commit" } })
    );
    const deleter = new GithubImageDeleter(config, createOctokit(fetch));

    await deleter.delete(key);

    const deleteRequest = fetch.mock.calls.find(([, init]) => init?.method === "DELETE");
    expect(deleteRequest).toBeDefined();
    expect(JSON.parse(String(deleteRequest?.[1]?.body))).toMatchObject({
      sha: validSha,
      branch: "main",
    });
  });

  it("resolves a legacy Cloudinary public ID to a file under public/", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async (input, init) => {
      const request = input instanceof Request ? input : undefined;
      const requestUrl = new URL(request?.url ?? String(input));
      const method = init?.method ?? request?.method;

      if (method === "DELETE") {
        return jsonResponse({ commit: { sha: "deleted-commit" } });
      }

      if (decodeURIComponent(requestUrl.pathname).endsWith("/slot-01.png")) {
        return jsonResponse({ type: "file", sha: validSha });
      }

      return jsonResponse({ message: "Not Found" }, 404);
    });
    const deleter = new GithubImageDeleter(config, createOctokit(fetch));

    await deleter.delete("org/portfolio/slot-01");

    const deleteRequest = fetch.mock.calls.find(([input, init]) =>
      init?.method === "DELETE" ||
      (input instanceof Request && input.method === "DELETE")
    );
    const deleteUrl = deleteRequest?.[0] instanceof Request
      ? deleteRequest[0].url
      : String(deleteRequest?.[0]);
    expect(decodeURIComponent(deleteUrl)).toContain(
      "/contents/public/org/portfolio/slot-01.png"
    );
    expect(JSON.parse(String(deleteRequest?.[1]?.body)).sha).toBe(validSha);
  });

  it("treats a missing image as already deleted", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () =>
      jsonResponse({ message: "Not Found" }, 404)
    );
    const deleter = new GithubImageDeleter(config, createOctokit(fetch));

    await expect(deleter.delete(key)).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("rejects invalid SHA metadata without deleting", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () =>
      jsonResponse({ type: "file", sha: "invalid-sha" })
    );
    const deleter = new GithubImageDeleter(config, createOctokit(fetch));

    await expect(deleter.delete(key)).rejects.toMatchObject({ status: 502 });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("rejects keys outside public before making an API request", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    const deleter = new GithubImageDeleter(config, createOctokit(fetch));

    await expect(deleter.delete("public/../private.png"))
      .rejects.toMatchObject({ status: 400 });
    await expect(deleter.delete("../private.png"))
      .rejects.toMatchObject({ status: 400 });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sanitizes authentication failures", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () =>
      jsonResponse({ message: "private response" }, 401)
    );
    const deleter = new GithubImageDeleter(config, createOctokit(fetch));

    await expect(deleter.delete(key)).rejects.toMatchObject({
      message: "GitHub authentication failed.",
      status: 502,
    });
  });

  it("sanitizes permission failures", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async () =>
      jsonResponse({ message: "private response" }, 403)
    );
    const deleter = new GithubImageDeleter(config, createOctokit(fetch));

    await expect(deleter.delete(key)).rejects.toMatchObject({
      message: "GitHub denied access to the image repository.",
      status: 502,
    });
  });
});