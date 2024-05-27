import { Intangible, Thing } from ".";

export class Offer extends Intangible {
  public price: string | number;

  public priceCurrency?: string;

  constructor(price: string | number) {
    super();
    this.setType("Offer");
    this.price = price;
    this.setPriceCurrency("USD");
  }

  public setPrice(price: string | number): this {
    this.price = price;
    return this;
  }

  public setPriceCurrency(priceCurrency: string): this {
    this.priceCurrency = priceCurrency;
    return this;
  }
}
