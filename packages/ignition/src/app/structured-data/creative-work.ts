import { Organization } from "./organization";
import { Thing } from "./thing";

export class CreativeWork extends Thing {
  public mainEntity?: Thing;

  public author?: Organization;

  constructor(name: string, description?: string) {
    super(name, "CreativeWork", description);
  }

  public setMainEntity(mainEntity: Thing): this {
    this.mainEntity = mainEntity;
    return this;
  }

  public setAuthor(author: Organization): this {
    this.author = author;
    return this;
  }
}
