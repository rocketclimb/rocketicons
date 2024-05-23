import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type UrlObserverProps = {
  onChanges: ({
    pathName,
    lastPath,
    hash
  }: {
    pathName: string;
    lastPath: string;
    hash: string;
    targetAnchor: string;
  }) => void;
};

const UrlChangesObserver = ({ onChanges }: UrlObserverProps) => {
  const searchParams = useSearchParams();
  const pathName = usePathname();

  useEffect(() => {
    const targetId = window.location.hash.substring(1);
    const target = document.getElementById(targetId); // I've never saw that on a react code...

    const lastPath = pathName.split("/").pop() ?? "";
    const hash = window.location.hash;
    const targetAnchor = hash && target ? targetId : lastPath;
    onChanges({
      pathName,
      lastPath,
      targetAnchor,
      hash
    });
  }, [pathName, searchParams]);
  return <></>;
};

const UrlObserver = (props: UrlObserverProps) => (
  <Suspense>
    <UrlChangesObserver {...props} />
  </Suspense>
);

export default UrlObserver;
