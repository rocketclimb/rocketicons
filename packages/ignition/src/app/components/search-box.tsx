// ./src/components/SearchBox.js

import { connectSearchBox } from "react-instantsearch-dom";
import Button from "./button";

function SearchBox({
  children,
  onClick = (e) => {},
  className,
}: {
  children?: any;
  onClick?: (e: any) => void;
  className?: string;
}) {
  return (
    <Button onClick={onClick} className={className}>
      {children}
    </Button>
  );
}

export default SearchBox;
