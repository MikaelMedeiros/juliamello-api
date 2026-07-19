import { OrganizationRepository } from "../repositories/auth/organization.repository";

export class SlugService {

  slugify(value: string): string {

    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  }

  async generateUniqueSlug(
    name: string,
    repository: OrganizationRepository
  ): Promise<string> {

    const base = this.slugify(name);

    let slug = base;
    let count = 1;

    while (await repository.findBySlug(slug)) {
      slug = `${base}-${count++}`;
    }

    return slug;

  }

}