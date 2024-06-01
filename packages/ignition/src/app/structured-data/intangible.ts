import { Thing } from "./thing";

export class Intangible extends Thing {
  constructor() {
    super();
    this.setType("Intangible");
  }
}
