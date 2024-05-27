import { Thing } from ".";

export class Person extends Thing {
  constructor(name: string) {
    super(name, "Person");
  }
}
