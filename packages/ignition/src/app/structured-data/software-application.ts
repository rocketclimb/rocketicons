import { CreativeWork, Offer } from ".";

export class SoftwareApplication extends CreativeWork {
  public applicationCategory: string | string[] = [];

  public operatingSystem: string = "All";

  public offers?: Offer | Offer[];

  constructor(name: string, description: string) {
    super(name, description);
    this.setType("SoftwareApplication");
  }

  public setApplicationCategory(category: string | string[]): this {
    this.applicationCategory = category;
    return this;
  }

  public setOperatingSystem(os: string): this {
    this.operatingSystem = os;
    return this;
  }

  public setOffers(offers: Offer | Offer[]): this {
    this.offers = offers;
    return this;
  }
}
