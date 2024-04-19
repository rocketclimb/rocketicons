import { connectSearchBox } from "react-instantsearch-dom";
import SearchBoxInnerContents from "@/components/search/search-box-inner-contents";

const SearchBoxInnerContentsAlgolia = ({
  label,
  refine,
  inputRef,
  className,
}: {
  label: string;
  refine: (value: string) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  className?: string;
}) => {
  return (
    <SearchBoxInnerContents
      label={label}
      refine={refine}
      inputRef={inputRef}
      className={className}
    />
  );
};

export default connectSearchBox(SearchBoxInnerContentsAlgolia);
