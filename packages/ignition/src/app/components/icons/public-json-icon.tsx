"use client";

import { CollectionID } from "./types";
import { FallbackIcon } from "./fallback-icon";
import { ComponentType, useState, useEffect, useMemo } from "react";
import { tree2Element, IconTree } from "./utils/tree-to-element";

type PublicJSONIconProps = {
  collection: CollectionID;
  name?: string; // Component name (for backward compatibility)
  iconId?: string; // Direct kebab-case icon ID (preferred)
  className?: string;
  fallback?: ComponentType<any>;
  size?: number | string;
} & Record<string, any>;

type IconData = {
  iconTree: {
    tag: string;
    attr: Record<string, any>;
    child: any[];
  };
  variant?: string;
};

// Handle className like rocketicons package
const handleClassName = (variant: string, className: string = "") => {
  return `icon-ri icon-default
    ${(["filled", "full"].includes(variant) && "icon-filled") || ""}
    ${(["outlined", "full"].includes(variant) && "icon-outlined") || ""}
    ${className}`
    .trim()
    .replace(/\s{2,}/g, " ");
};

// Check if className contains rocketicons size classes
const hasRocketIconsSize = (className: string = "") => {
  // Check for icon-* size classes (e.g., icon-lg, icon-xl, icon-base)
  // or combined classes like icon-sky-500-lg
  return /\bicon-(?:\w+-)*(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl)\b/.test(className);
};

// JSON cache to avoid re-fetching
const jsonCache = new Map<string, IconData>();
const loadingPromises = new Map<string, Promise<IconData>>();

// Convert component name to file name format (DEPRECATED - use iconId instead)
const componentNameToFileName = (componentName: string, collectionId: string) => {
  // RcRocketIcon -> rc-rocket-icon.json
  // IoMenuOutline -> io-menu-outline.json

  // Convert PascalCase to kebab-case
  const kebabCase = componentName
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "");

  // If the kebab-case doesn't start with the collection prefix, add it
  if (!kebabCase.startsWith(collectionId + "-")) {
    return `${collectionId}-${kebabCase}.json`;
  }

  return `${kebabCase}.json`;
};

const loadJSONFromPublic = async (
  collection: CollectionID,
  iconId: string
): Promise<IconData> => {
  const cacheKey = `${collection}:${iconId}`;

  if (jsonCache.has(cacheKey)) {
    return jsonCache.get(cacheKey)!;
  }

  if (loadingPromises.has(cacheKey)) {
    return loadingPromises.get(cacheKey)!;
  }

  const loadPromise = (async () => {
    try {
      // Use iconId directly as filename (it's already in kebab-case format)
      const fileName = `${iconId}.json`;

      // Load JSON from public folder: /public/icons/ai/ai-fill-account-book.json
      const response = await fetch(`/icons/${collection}/${fileName}`);
      if (!response.ok) {
        throw new Error(`Icon JSON not found: /icons/${collection}/${fileName}`);
      }

      const iconData = (await response.json()) as IconData;
      jsonCache.set(cacheKey, iconData);
      return iconData;
    } catch (error) {
      console.warn(`Failed to load icon JSON: ${collection}/${iconId}`, error);

      // Fallback icon data
      const fallbackData: IconData = {
        iconTree: {
          tag: "svg",
          attr: { viewBox: "0 0 24 24", fill: "currentColor" },
          child: [
            {
              tag: "circle",
              attr: { cx: "12", cy: "12", r: "10", opacity: "0.3" }
            },
            {
              tag: "text",
              attr: {
                x: "12",
                y: "16",
                textAnchor: "middle",
                fontSize: "8",
                fill: "currentColor"
              },
              child: ["?"]
            }
          ]
        }
      };

      jsonCache.set(cacheKey, fallbackData);
      return fallbackData;
    }
  })();

  loadingPromises.set(cacheKey, loadPromise);

  try {
    const iconData = await loadPromise;
    loadingPromises.delete(cacheKey);
    return iconData;
  } catch (error) {
    loadingPromises.delete(cacheKey);
    throw error;
  }
};

export const PublicJSONIcon = ({
  collection,
  name,
  iconId,
  className = "",
  fallback: Fallback = FallbackIcon,
  size = 24,
  ...props
}: PublicJSONIconProps) => {
  const [iconData, setIconData] = useState<IconData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Determine the icon identifier to use
  const actualIconId =
    iconId || (name ? componentNameToFileName(name, collection).replace(".json", "") : "");
  const cacheKey = useMemo(() => `${collection}:${actualIconId}`, [collection, actualIconId]);

  useEffect(() => {
    if (!actualIconId) {
      setError(true);
      setLoading(false);
      return;
    }

    let mounted = true;

    // Check cache first
    if (jsonCache.has(cacheKey)) {
      const cached = jsonCache.get(cacheKey)!;
      setIconData(cached);
      setLoading(false);
      return;
    }

    // Load JSON from public folder
    loadJSONFromPublic(collection, actualIconId)
      .then((data) => {
        if (mounted) {
          setIconData(data);
          setLoading(false);
          setError(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [cacheKey, collection, actualIconId]);

  // Check if we should use CSS sizing or inline sizing
  const useCSSSizing = hasRocketIconsSize(className);

  // Show fallback while loading or on error
  if (loading || error || !iconData) {
    return (
      <Fallback
        {...props}
        className={handleClassName("full", className)}
        style={{
          opacity: loading ? 0.5 : 1,
          // Only set inline size if no rocketicons size classes are present
          ...(useCSSSizing ? {} : { width: size, height: size }),
          ...props.style
        }}
      />
    );
  }

  // Render SVG using rocketicons utilities
  const { iconTree, variant = "full" } = iconData;

  // Apply rocketicons className handling with actual variant
  const processedClassName = handleClassName(variant, className);

  return (
    <svg
      {...iconTree.attr}
      className={processedClassName}
      style={{
        display: "inline-block",
        // Only set inline size if no rocketicons size classes are present
        ...(useCSSSizing ? {} : { width: size, height: size }),
        ...props.style
      }}
      {...props}
    >
      {tree2Element(iconTree.child)}
    </svg>
  );
};

// Preload function for critical icons
export const preloadIconJSON = (collection: CollectionID, iconId: string) => {
  loadJSONFromPublic(collection, iconId).catch(() => {
    // Silently fail for preloading
  });
};

// Batch preload function
export const preloadIconsJSON = (icons: Array<{ collection: CollectionID; iconId: string }>) => {
  icons.forEach(({ collection, iconId }) => {
    preloadIconJSON(collection, iconId);
  });
};

export default PublicJSONIcon;
