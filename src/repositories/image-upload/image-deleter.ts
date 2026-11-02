export interface ImageDeleter {
  delete(key: string): Promise<void>;
}