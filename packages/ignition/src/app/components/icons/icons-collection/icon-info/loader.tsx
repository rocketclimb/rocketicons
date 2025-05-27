import { CollectionID } from "@/app/components/icons/types";
import { PropsWithLang } from "@/types";

import IconLoader from "@/components/icons/icon-loader";
import InfoHandler from "./info-handler";
import { PublicJSONIcon } from "@/app/components/icons/public-json-icon";
import { asCompName } from "@/components/icons/get-icons-data";

const Loading = () => (
  <div className="h-full w-full flex justify-center items-center">
    <PublicJSONIcon
      collection="rc"
      iconId="rc-rocket-icon"
      className="animate-ping size-16 lg:size-28"
    />
  </div>
);

type IconInfoLoaderProps = PropsWithLang & {
  collectionId: CollectionID;
  iconId: string;
};

// Convert URL parameter (kebab-case like 'ai-fill-home') to component name (like 'AiFillHome')
const urlParamToComponentName = (urlParam: string, collectionId: string): string => {
  // If it already looks like a component name (starts with uppercase), return as-is
  if (/^[A-Z]/.test(urlParam)) {
    return urlParam;
  }

  // Handle kebab-case URLs like 'ai-fill-home' -> 'AiFillHome'
  if (urlParam.includes("-")) {
    // Split by dashes and convert to PascalCase
    const parts = urlParam.split("-");
    return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
  }

  // Handle lowercase URLs like 'aifillhome' -> 'AiFillHome' (fallback)
  const collectionPrefix = collectionId.charAt(0).toUpperCase() + collectionId.slice(1);

  // Remove collection prefix if it exists in lowercase
  let iconPart = urlParam;
  if (urlParam.toLowerCase().startsWith(collectionId.toLowerCase())) {
    iconPart = urlParam.slice(collectionId.length);
  }

  // Convert to PascalCase
  const iconName = iconPart.charAt(0).toUpperCase() + iconPart.slice(1);

  return collectionPrefix + iconName;
};

const IconInfoLoader = ({ lang, collectionId, iconId }: IconInfoLoaderProps) => {
  // Convert iconId (kebab-case) back to component name format
  const componentName = urlParamToComponentName(iconId, collectionId);

  return (
    <IconLoader
      collectionId={collectionId}
      icon={componentName}
      Handler={InfoHandler}
      Loading={Loading}
      lang={lang}
    />
  );
};

export default IconInfoLoader;
