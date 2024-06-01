import { Thing } from "./thing";

export class Action extends Thing {
  public target: string;

  constructor() {
    super();
    this.setType("Action");
    this.target = "";
  }

  public setTarget(target: string): this {
    this.target = target;
    return this;
  }
}
