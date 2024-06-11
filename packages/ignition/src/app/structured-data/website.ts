import { CreativeWork } from "./creative-work";

export class WebSite extends CreativeWork {
  constructor(name: string, description: string) {
    super(name, description);
    this.setType("WebSite");
  }
}
