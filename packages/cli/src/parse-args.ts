// Parse command, value and configuration parameters
type Value = string | boolean | number;

const parseArgs = () => {
  const args = process.argv.slice(2);
  let command = "";
  let value = "";
  const config = {} as Record<string, Value>;
  const params = {} as Record<string, Value>;

  const checkValue = <T extends Value>(defaultValue: T): T => {
    const [next] = args;
    if (!next || next.startsWith("--")) {
      return defaultValue;
    }
    return args.shift() as T;
  };

  do {
    const arg = args.shift();
    if (!command) {
      if (!arg || arg.startsWith("--")) {
        throw new Error("Command not found");
      }
      command = arg;
      value = checkValue("");
    } else if (arg?.startsWith("--")) {
      config[arg.slice(2)] = checkValue(true);
    } else if (arg) {
      params[arg] = checkValue("");
    }
  } while (args.length);

  return { command, value, config, params };
};

export default parseArgs;
