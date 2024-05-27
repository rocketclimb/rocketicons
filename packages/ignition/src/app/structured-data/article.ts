import { CreativeWork } from ".";

export class Article extends CreativeWork {
  public headline?: string;

  constructor(name: string, description: string) {
    super(name, description);
    this.setType("Article");
    this.setHeadline(name);
  }

  public setHeadline(headline: string): this {
    this.headline = headline;
    return this;
  }
}
