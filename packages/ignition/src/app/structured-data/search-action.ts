import { Action } from "./action";

export class SearchAction extends Action {
  public "query-input": string;

  constructor(target: string, queryInput: string) {
    super();
    this.setType("SearchAction");
    this.setTarget(`${target}/icons/{collectionid}`);
    this["query-input"] = `required name=collectionid`;
  }
}
