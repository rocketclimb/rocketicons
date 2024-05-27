import { Person, Thing } from ".";

// a type with all the possible organization types from schema.org
export type OrganizationType =
  | "Organization"
  | "Corporation"
  | "EducationalOrganization"
  | "GovernmentOrganization"
  | "NGO";

export type FoundersTypes = Person | Organization;

export class Organization extends Thing {
  public email?: string;

  public founders?: FoundersTypes[];

  public logo?: string;

  constructor(name: string, organizationType?: OrganizationType) {
    super(name, organizationType ?? "Organization");
  }

  public setEmail(email: string): this {
    this.email = email;
    return this;
  }

  public setFounders(founders: FoundersTypes[] | string[]): this {
    this.founders = founders.map((founder) => {
      if (typeof founder === "string") {
        return new Person(founder);
      }

      return founder;
    });
    return this;
  }

  public setLogo(logo: string): this {
    this.logo = logo;
    return this;
  }
}
