
// THIS FILE IS AUTO GENERATED
import dynamic from 'next/dynamic'
import { IconType } from "rocketicons";
import { CollectionDataInfo } from "rocketicons";
import { CollectionID, License } from "rocketicons/data";

export type HandlerPros = {
  manifest: CollectionDataInfo<CollectionID, License>
  collection: Record<string, IconType>;
}

type IconsLoaderProps<T extends HandlerPros> = {
  collectionId: CollectionID;
  Handler: (props: T) => JSX.Element;
  Loading?: () => JSX.Element;
} & Omit<T, keyof HandlerPros>;

const IconsLoader = <T extends HandlerPros>({
  collectionId,
  Handler,
  Loading,
  ...props
}: IconsLoaderProps<T>) => {
  Loading = Loading || (() => <p>Loading...</p>);

  const IconsRC = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/rc");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsCI = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/ci");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsFA = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/fa");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsFA6 = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/fa6");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsIO = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/io");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsIO5 = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/io5");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsMD = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/md");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsTI = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/ti");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsGO = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/go");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsFI = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/fi");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsLU = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/lu");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsGI = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/gi");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsWI = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/wi");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsDI = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/di");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsAI = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/ai");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsBS = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/bs");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsRI = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/ri");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsFC = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/fc");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsGR = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/gr");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsHI = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/hi");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsHI2 = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/hi2");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsSI = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/si");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsSL = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/sl");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsIM = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/im");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsBI = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/bi");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsCG = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/cg");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsVSC = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/vsc");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsTB = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/tb");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsTFI = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/tfi");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsRX = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/rx");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsPI = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/pi");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  const IconsLIA = dynamic(
    async () => {
      const {
        manifest,
        default: _d,
        ...Icons
      } = await import("rocketicons/lia");
      return () => (
        // @ts-ignore
        <Handler manifest={manifest} collection={Icons} {...props} />
      );
    },
    {
      loading: () => <Loading />,
    }
  );

  if ( collectionId === "rc" ) {
    return <IconsRC />;
  }

  if ( collectionId === "ci" ) {
    return <IconsCI />;
  }

  if ( collectionId === "fa" ) {
    return <IconsFA />;
  }

  if ( collectionId === "fa6" ) {
    return <IconsFA6 />;
  }

  if ( collectionId === "io" ) {
    return <IconsIO />;
  }

  if ( collectionId === "io5" ) {
    return <IconsIO5 />;
  }

  if ( collectionId === "md" ) {
    return <IconsMD />;
  }

  if ( collectionId === "ti" ) {
    return <IconsTI />;
  }

  if ( collectionId === "go" ) {
    return <IconsGO />;
  }

  if ( collectionId === "fi" ) {
    return <IconsFI />;
  }

  if ( collectionId === "lu" ) {
    return <IconsLU />;
  }

  if ( collectionId === "gi" ) {
    return <IconsGI />;
  }

  if ( collectionId === "wi" ) {
    return <IconsWI />;
  }

  if ( collectionId === "di" ) {
    return <IconsDI />;
  }

  if ( collectionId === "ai" ) {
    return <IconsAI />;
  }

  if ( collectionId === "bs" ) {
    return <IconsBS />;
  }

  if ( collectionId === "ri" ) {
    return <IconsRI />;
  }

  if ( collectionId === "fc" ) {
    return <IconsFC />;
  }

  if ( collectionId === "gr" ) {
    return <IconsGR />;
  }

  if ( collectionId === "hi" ) {
    return <IconsHI />;
  }

  if ( collectionId === "hi2" ) {
    return <IconsHI2 />;
  }

  if ( collectionId === "si" ) {
    return <IconsSI />;
  }

  if ( collectionId === "sl" ) {
    return <IconsSL />;
  }

  if ( collectionId === "im" ) {
    return <IconsIM />;
  }

  if ( collectionId === "bi" ) {
    return <IconsBI />;
  }

  if ( collectionId === "cg" ) {
    return <IconsCG />;
  }

  if ( collectionId === "vsc" ) {
    return <IconsVSC />;
  }

  if ( collectionId === "tb" ) {
    return <IconsTB />;
  }

  if ( collectionId === "tfi" ) {
    return <IconsTFI />;
  }

  if ( collectionId === "rx" ) {
    return <IconsRX />;
  }

  if ( collectionId === "pi" ) {
    return <IconsPI />;
  }

  if ( collectionId === "lia" ) {
    return <IconsLIA />;
  }

}

export default IconsLoader;
