import { describe, expect, it, vi } from "vitest";
import { Image } from "../src/models/image";
import { ImageDeleter } from "../src/repositories/image-upload/image-deleter";
import { ImageRepository } from "../src/repositories/image-upload/image.repository";
import { ImageUploader } from "../src/repositories/image-upload/image-uploader";
import { ImageService } from "../src/services/image.service";

const existingImage: Image = {
  id: "image-id",
  organizationId: "org-id",
  userId: "user-id",
  key: "legacy-cloudinary-key",
  url: "https://images.example/old.jpg",
  width: 100,
  height: 100,
  filename: "old.jpg",
  contentType: "image/jpeg",
  size: 10,
  section: "portfolio",
  position: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("ImageService", () => {
  it("accepts an upload-only implementation without a delete method", async () => {
    const uploader: ImageUploader = {
      upload: vi.fn().mockResolvedValue({
        key: "public/org/portfolio/slot-01.png",
        url: "https://raw.githubusercontent.com/site/repo/commit-sha/assets/image.png",
        width: 1,
        height: 1,
      }),
    };
    const deleter: ImageDeleter = {
      delete: vi.fn().mockResolvedValue(undefined),
    };
    const repository: ImageRepository = {
      create: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn().mockResolvedValue(null),
      findBySlot: vi.fn().mockResolvedValue(null),
      findBySection: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(null),
    };
    const service = new ImageService(uploader, deleter, repository);

    const response = await service.upload(
      "org-id",
      "user-id",
      "org",
      new File([new Uint8Array([1])], "image.png", { type: "image/png" }),
      "portfolio",
      1
    );

    expect(response.url).toContain("raw.githubusercontent.com");
    expect(uploader.upload).toHaveBeenCalled();
  });

  it("cleans up a legacy asset only after the new D1 record is updated", async () => {
    const callOrder: string[] = [];
    const uploader: ImageUploader = {
      upload: vi.fn().mockResolvedValue({
        key: "public/org/portfolio/slot-01.png",
        url: "https://raw.githubusercontent.com/site/repo/commit-sha/assets/image.png",
        width: 1,
        height: 1,
      }),
    };
    const deleter: ImageDeleter = {
      delete: vi.fn(async () => {
        callOrder.push("delete");
      }),
    };
    const repository: ImageRepository = {
      create: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn().mockResolvedValue(null),
      findBySlot: vi.fn().mockResolvedValue(existingImage),
      findBySection: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue(undefined),
      update: vi.fn(async image => {
        callOrder.push("update");
        return image;
      }),
    };
    const service = new ImageService(uploader, deleter, repository);

    const response = await service.upload(
      existingImage.organizationId,
      existingImage.userId,
      "org",
      new File([new Uint8Array([1])], "new.png", { type: "image/png" }),
      "portfolio",
      1
    );

    expect(response.id).toBe(existingImage.id);
    expect(response.url).toContain("raw.githubusercontent.com");
    expect(callOrder).toEqual(["update", "delete"]);
    expect(deleter.delete).toHaveBeenCalledWith(existingImage.key);
  });
});