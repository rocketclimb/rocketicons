export interface IconDefinition {
  id: string;
  compPrefix?: string;
  name: string;
  contents: IconDefinitionContent[];
  projectUrl: string;
  license: string;
  licenseUrl: string;
  source?: IconSetSource;
}

export interface IconDefinitionContent {
  files: string | (() => Promise<string[]>);
  formatter(camelName: string, filePath: string): string;
  multiColor?: boolean;
  processWithSVGO?: boolean;
}

export type IconSetSource = IconSetGitSource;

type PackageJsonExports = {
  ["./package.json"]: {
    default: "./package.json";
  };
};

export type PackageExports =
  | PackageJsonExports
  | Record<
      string,
      {
        types: string;
        require: string;
        import: string;
        default: string;
      }
    >;

export type Overrrides = {
  name?: string;
  exports: PackageExports;
};

export interface IconSetGitSource {
  type: "git";
  localName: string;
  remoteDir: string;
  url: string;
  branch: string;
  hash: string;
}

export interface TaskContext {
  rootDir: string;
  DIST: string;
  LIB: string;
  PLUGIN: string;
  DATA: string;
  SVGS: string;
}

export interface Context {
  distBaseDir: string;
  iconDir(name: string): string;
}
