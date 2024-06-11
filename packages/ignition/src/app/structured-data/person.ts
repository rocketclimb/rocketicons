import { Thing } from "./thing";

export class Person extends Thing {
  constructor(name: string) {
    super(name, "Person");
  }
}
