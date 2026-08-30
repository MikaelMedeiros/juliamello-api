import { ImageStorage } from "./image-storage";
import { ImageStorageResult } from "./model/image-storage-result.model";

export class CloudinaryImageStorageRepository
  implements ImageStorage {

  constructor(
    private readonly cloudName: string,
    private readonly apiKey: string,
    private readonly apiSecret: string
  ) {}

  async upload(
    publicId: string,  
    folder: string,  
    file: File
  ): Promise<ImageStorageResult> {

    const timestamp = Math.floor(
      Date.now() / 1000
    );

    const formData = new FormData();

    formData.append(
      "file",
      file
    );

    formData.append(
      "api_key",
      this.apiKey
    );

    formData.append(
      "timestamp",
      timestamp.toString()
    );
    
    formData.append(
      "folder",
      folder
    );

    formData.append(
      "public_id",
      publicId
    );

    formData.append(
      "overwrite",
      "true"
    );

    formData.append(
      "invalidate",
      "true"
    );

    const signature =
      await this.generateSignature({
        folder,
        invalidate: "true",
        overwrite: "true",
        public_id: publicId,
        timestamp: timestamp.toString(),
      });

    formData.append(
      "signature",
      signature
    );

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.text();

      throw new Error(
        `Cloudinary upload failed: ${error}`
      );
    }

    const result = await response.json() as CloudinaryUploadResponse;

    return {
      key: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
    };
  }

  async delete(
    key: string
  ): Promise<void> {

    const timestamp = Math.floor(
      Date.now() / 1000
    );   

    const signature =
      await this.generateSignature({        
        invalidate: "true",        
        public_id: key,
        timestamp: timestamp.toString(),
      });

    const formData = new FormData();

    formData.append(
      "public_id",
      key
    );

    formData.append(
      "timestamp",
      timestamp.toString()
    );

    formData.append(
      "api_key",
      this.apiKey
    );

    formData.append(
      "invalidate",
      "true"
    );

    formData.append(
      "signature",
      signature
    );
    

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.text();

      throw new Error(
        `Cloudinary delete failed: ${error}`
      );
    }    
  }

  private async generateSignature(
    params: Record<string, string>
  ): Promise<string> {

    const serialized = Object
      .keys(params)
      .sort()
      .map(
        key => `${key}=${params[key]}`
      )
      .join("&");

    const value =
      `${serialized}${this.apiSecret}`;

    const data = new TextEncoder().encode(value);

    const hash = await crypto.subtle.digest(
      "SHA-256",
      data
    );

    return Array
      .from(new Uint8Array(hash))
      .map(
        byte => byte.toString(16).padStart(2, "0")
      )
      .join("");
  }
}