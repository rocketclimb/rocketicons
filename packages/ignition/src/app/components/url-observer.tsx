import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type UrlObserverProps = {
  onChanges: (hash: string) => void;
};

const UrlChangesObserver = ({ onChanges }: UrlObserverProps) => {
  const searchParams = useSearchParams();
  const pathName = usePathname();

  useEffect(() => {
    const targetId = window.location.hash.substring(1);
    const target = document.getElementById(targetId); // I've never saw that on a react code...
    onChanges(
      window.location.hash && target
        ? targetId
        : (pathName.split("/").pop() as string)
    );
  }, [pathName, searchParams]);
  return <></>;
};

const UrlObserver = (props: UrlObserverProps) => (
  <Suspense>
    <UrlChangesObserver {...props} />
  </Suspense>
);

export default UrlObserver;
