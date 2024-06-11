import { SearchAction } from "./search-action";

export type ActionTypes = SearchAction;

export class Thing {
  private "@context": string;

  private "@type": string;

  public name: string | undefined;

  public description: string | undefined;

  public image?: string | undefined;

  public url?: string;

  public sameAs?: string | string[];

  public potentialAction?: ActionTypes | ActionTypes[];

  constructor(name?: string, thingType?: string, description?: string) {
    this["@context"] = "https://schema.org";
    this["@type"] = thingType ?? "Thing";
    this.name = name;

    if (description) {
      this.description = description;
    }
  }

  protected setType(type: string): this {
    this["@type"] = type;
    return this;
  }

  public setName(name: string): this {
    this.name = name;
    return this;
  }

  public setDescription(description: string): this {
    this.description = description;
    return this;
  }

  public setImage(image: string): this {
    this.image = image;
    return this;
  }

  public setUrl(url: string): this {
    this.url = url;
    return this;
  }

  public setSameAs(sameAs: string | string[]): this {
    this.sameAs = sameAs;
    return this;
  }

  public setPotentialAction(action: ActionTypes | ActionTypes[]): this {
    this.potentialAction = action;
    return this;
  }
}
