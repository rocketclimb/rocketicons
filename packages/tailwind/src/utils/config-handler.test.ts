import { describe, jest, expect, test, beforeAll } from "@jest/globals";
import {
  configHandler,
} from "./config-handler";

import { 
  Config,
  StyleHandler,
  ThemeOptions,
} from '@/types';

describe("configHandler", () => {
  describe("Styles", () => {
    const colors = {
      primary: {
        "500": "#ffffff",
      },
      secondary: {
        "200": "#f1f1f1",
      },
      tertiary: {
        "500": "#f2f2f2",
        DEFAULT: "#f3fef3",
      },
      quaternary: "#f4f4f4",
    };

    const baseConfig: ThemeOptions = {
      default: "secondary-lg",
      baseStyle: "p1",
      variants: {
        outlined: "border",
        filled: "center",
      },
      sizes: {
        sm: "w-1 h-1",
        md: "w-2 h-2",
        lg: "w-4 h-4",
      },
    };

    const baseExpectations = {
      name: "Base",
      config: {},
      variants: [
        {
          variant: "outlined",
          name: "default",
          styles: "p1 border fill-secondary-200 stroke-secondary-200 w-4 h-4",
          colors: [
            {
              variant: "outlined",
              name: "primary",
              styles: "p1 border fill-primary-500 stroke-primary-500 w-4 h-4",
              sizes: [
                {
                  variant: "outlined",
                  name: "sm",
                  styles:
                    "p1 border fill-primary-500 stroke-primary-500 w-1 h-1",
                },
                {
                  variant: "outlined",
                  name: "md",
                  styles:
                    "p1 border fill-primary-500 stroke-primary-500 w-2 h-2",
                },
                {
                  variant: "outlined",
                  name: "lg",
                  styles:
                    "p1 border fill-primary-500 stroke-primary-500 w-4 h-4",
                },
              ],
            },
            {
              variant: "outlined",
              name: "primary-500",
              styles: "p1 border fill-primary-500 stroke-primary-500 w-4 h-4",
              sizes: [
                {
                  variant: "outlined",
                  name: "sm",
                  styles:
                    "p1 border fill-primary-500 stroke-primary-500 w-1 h-1",
                },
                {
                  variant: "outlined",
                  name: "md",
                  styles:
                    "p1 border fill-primary-500 stroke-primary-500 w-2 h-2",
                },
                {
                  variant: "outlined",
                  name: "lg",
                  styles:
                    "p1 border fill-primary-500 stroke-primary-500 w-4 h-4",
                },
              ],
            },
            {
              variant: "outlined",
              name: "secondary",
              styles:
                "p1 border fill-secondary-200 stroke-secondary-200 w-4 h-4",
              sizes: [
                {
                  variant: "outlined",
                  name: "sm",
                  styles:
                    "p1 border fill-secondary-200 stroke-secondary-200 w-1 h-1",
                },
                {
                  variant: "outlined",
                  name: "md",
                  styles:
                    "p1 border fill-secondary-200 stroke-secondary-200 w-2 h-2",
                },
                {
                  variant: "outlined",
                  name: "lg",
                  styles:
                    "p1 border fill-secondary-200 stroke-secondary-200 w-4 h-4",
                },
              ],
            },
            {
              variant: "outlined",
              name: "secondary-200",
              styles:
                "p1 border fill-secondary-200 stroke-secondary-200 w-4 h-4",
              sizes: [
                {
                  variant: "outlined",
                  name: "sm",
                  styles:
                    "p1 border fill-secondary-200 stroke-secondary-200 w-1 h-1",
                },
                {
                  variant: "outlined",
                  name: "md",
                  styles:
                    "p1 border fill-secondary-200 stroke-secondary-200 w-2 h-2",
                },
                {
                  variant: "outlined",
                  name: "lg",
                  styles:
                    "p1 border fill-secondary-200 stroke-secondary-200 w-4 h-4",
                },
              ],
            },
            {
              variant: "outlined",
              name: "tertiary",
              styles: "p1 border fill-tertiary stroke-tertiary w-4 h-4",
              sizes: [
                {
                  variant: "outlined",
                  name: "sm",
                  styles: "p1 border fill-tertiary stroke-tertiary w-1 h-1",
                },
                {
                  variant: "outlined",
                  name: "md",
                  styles: "p1 border fill-tertiary stroke-tertiary w-2 h-2",
                },
                {
                  variant: "outlined",
                  name: "lg",
                  styles: "p1 border fill-tertiary stroke-tertiary w-4 h-4",
                },
              ],
            },
            {
              variant: "outlined",
              name: "tertiary-500",
              styles: "p1 border fill-tertiary-500 stroke-tertiary-500 w-4 h-4",
              sizes: [
                {
                  variant: "outlined",
                  name: "sm",
                  styles:
                    "p1 border fill-tertiary-500 stroke-tertiary-500 w-1 h-1",
                },
                {
                  variant: "outlined",
                  name: "md",
                  styles:
                    "p1 border fill-tertiary-500 stroke-tertiary-500 w-2 h-2",
                },
                {
                  variant: "outlined",
                  name: "lg",
                  styles:
                    "p1 border fill-tertiary-500 stroke-tertiary-500 w-4 h-4",
                },
              ],
            },
            {
              variant: "outlined",
              name: "quaternary",
              styles: "p1 border fill-quaternary stroke-quaternary w-4 h-4",
              sizes: [
                {
                  variant: "outlined",
                  name: "sm",
                  styles: "p1 border fill-quaternary stroke-quaternary w-1 h-1",
                },
                {
                  variant: "outlined",
                  name: "md",
                  styles: "p1 border fill-quaternary stroke-quaternary w-2 h-2",
                },
                {
                  variant: "outlined",
                  name: "lg",
                  styles: "p1 border fill-quaternary stroke-quaternary w-4 h-4",
                },
              ],
            },
          ],
        },
        {
          variant: "filled",
          name: "default",
          styles: "p1 center fill-secondary-200 stroke-secondary-200 w-4 h-4",
          colors: [
            {
              variant: "filled",
              name: "primary",
              styles: "p1 center fill-primary-500 stroke-primary-500 w-4 h-4",
              sizes: [
                {
                  variant: "filled",
                  name: "sm",
                  styles:
                    "p1 center fill-primary-500 stroke-primary-500 w-1 h-1",
                },
                {
                  variant: "filled",
                  name: "md",
                  styles:
                    "p1 center fill-primary-500 stroke-primary-500 w-2 h-2",
                },
                {
                  variant: "filled",
                  name: "lg",
                  styles:
                    "p1 center fill-primary-500 stroke-primary-500 w-4 h-4",
                },
              ],
            },
            {
              variant: "filled",
              name: "primary-500",
              styles: "p1 center fill-primary-500 stroke-primary-500 w-4 h-4",
              sizes: [
                {
                  variant: "filled",
                  name: "sm",
                  styles:
                    "p1 center fill-primary-500 stroke-primary-500 w-1 h-1",
                },
                {
                  variant: "filled",
                  name: "md",
                  styles:
                    "p1 center fill-primary-500 stroke-primary-500 w-2 h-2",
                },
                {
                  variant: "filled",
                  name: "lg",
                  styles:
                    "p1 center fill-primary-500 stroke-primary-500 w-4 h-4",
                },
              ],
            },
            {
              variant: "filled",
              name: "secondary",
              styles:
                "p1 center fill-secondary-200 stroke-secondary-200 w-4 h-4",
              sizes: [
                {
                  variant: "filled",
                  name: "sm",
                  styles:
                    "p1 center fill-secondary-200 stroke-secondary-200 w-1 h-1",
                },
                {
                  variant: "filled",
                  name: "md",
                  styles:
                    "p1 center fill-secondary-200 stroke-secondary-200 w-2 h-2",
                },
                {
                  variant: "filled",
                  name: "lg",
                  styles:
                    "p1 center fill-secondary-200 stroke-secondary-200 w-4 h-4",
                },
              ],
            },
            {
              variant: "filled",
              name: "secondary-200",
              styles:
                "p1 center fill-secondary-200 stroke-secondary-200 w-4 h-4",
              sizes: [
                {
                  variant: "filled",
                  name: "sm",
                  styles:
                    "p1 center fill-secondary-200 stroke-secondary-200 w-1 h-1",
                },
                {
                  variant: "filled",
                  name: "md",
                  styles:
                    "p1 center fill-secondary-200 stroke-secondary-200 w-2 h-2",
                },
                {
                  variant: "filled",
                  name: "lg",
                  styles:
                    "p1 center fill-secondary-200 stroke-secondary-200 w-4 h-4",
                },
              ],
            },
            {
              variant: "filled",
              name: "tertiary",
              styles: "p1 center fill-tertiary stroke-tertiary w-4 h-4",
              sizes: [
                {
                  variant: "filled",
                  name: "sm",
                  styles: "p1 center fill-tertiary stroke-tertiary w-1 h-1",
                },
                {
                  variant: "filled",
                  name: "md",
                  styles: "p1 center fill-tertiary stroke-tertiary w-2 h-2",
                },
                {
                  variant: "filled",
                  name: "lg",
                  styles: "p1 center fill-tertiary stroke-tertiary w-4 h-4",
                },
              ],
            },
            {
              variant: "filled",
              name: "tertiary-500",
              styles: "p1 center fill-tertiary-500 stroke-tertiary-500 w-4 h-4",
              sizes: [
                {
                  variant: "filled",
                  name: "sm",
                  styles:
                    "p1 center fill-tertiary-500 stroke-tertiary-500 w-1 h-1",
                },
                {
                  variant: "filled",
                  name: "md",
                  styles:
                    "p1 center fill-tertiary-500 stroke-tertiary-500 w-2 h-2",
                },
                {
                  variant: "filled",
                  name: "lg",
                  styles:
                    "p1 center fill-tertiary-500 stroke-tertiary-500 w-4 h-4",
                },
              ],
            },
            {
              variant: "filled",
              name: "quaternary",
              styles: "p1 center fill-quaternary stroke-quaternary w-4 h-4",
              sizes: [
                {
                  variant: "filled",
                  name: "sm",
                  styles: "p1 center fill-quaternary stroke-quaternary w-1 h-1",
                },
                {
                  variant: "filled",
                  name: "md",
                  styles: "p1 center fill-quaternary stroke-quaternary w-2 h-2",
                },
                {
                  variant: "filled",
                  name: "lg",
                  styles: "p1 center fill-quaternary stroke-quaternary w-4 h-4",
                },
              ],
            },
          ],
        },
      ],
      sizes: [
        {
          variant: "outlined",
          name: "sm",
          styles: "p1 border fill-secondary-200 stroke-secondary-200 w-1 h-1",
        },
        {
          variant: "outlined",
          name: "md",
          styles: "p1 border fill-secondary-200 stroke-secondary-200 w-2 h-2",
        },
        {
          variant: "outlined",
          name: "lg",
          styles: "p1 border fill-secondary-200 stroke-secondary-200 w-4 h-4",
        },
        {
          variant: "filled",
          name: "sm",
          styles: "p1 center fill-secondary-200 stroke-secondary-200 w-1 h-1",
        },
        {
          variant: "filled",
          name: "md",
          styles: "p1 center fill-secondary-200 stroke-secondary-200 w-2 h-2",
        },
        {
          variant: "filled",
          name: "lg",
          styles: "p1 center fill-secondary-200 stroke-secondary-200 w-4 h-4",
        },
      ],
    };

    const extendingExpectations = {
      name: "Extends",
      config: {
        extends: {
          icon: {
            default: "tertiary-500-lg",
          },
        },
      },
      variants: [
        {
          variant: "outlined",
          name: "default",
          styles: "p1 border fill-tertiary-500 stroke-tertiary-500 w-4 h-4",
          colors: [
            {
              variant: "outlined",
              name: "primary",
              styles: "p1 border fill-primary-500 stroke-primary-500 w-4 h-4",
              sizes: [
                {
                  variant: "outlined",
                  name: "sm",
                  styles:
                    "p1 border fill-primary-500 stroke-primary-500 w-1 h-1",
                },
                {
                  variant: "outlined",
                  name: "md",
                  styles:
                    "p1 border fill-primary-500 stroke-primary-500 w-2 h-2",
                },
                {
                  variant: "outlined",
                  name: "lg",
                  styles:
                    "p1 border fill-primary-500 stroke-primary-500 w-4 h-4",
                },
              ],
            },
            {
              variant: "outlined",
              name: "primary-500",
              styles: "p1 border fill-primary-500 stroke-primary-500 w-4 h-4",
              sizes: [
                {
                  variant: "outlined",
                  name: "sm",
                  styles:
                    "p1 border fill-primary-500 stroke-primary-500 w-1 h-1",
                },
                {
                  variant: "outlined",
                  name: "md",
                  styles:
                    "p1 border fill-primary-500 stroke-primary-500 w-2 h-2",
                },
                {
                  variant: "outlined",
                  name: "lg",
                  styles:
                    "p1 border fill-primary-500 stroke-primary-500 w-4 h-4",
                },
              ],
            },
            {
              variant: "outlined",
              name: "secondary",
              styles:
                "p1 border fill-secondary-200 stroke-secondary-200 w-4 h-4",
              sizes: [
                {
                  variant: "outlined",
                  name: "sm",
                  styles:
                    "p1 border fill-secondary-200 stroke-secondary-200 w-1 h-1",
                },
                {
                  variant: "outlined",
                  name: "md",
                  styles:
                    "p1 border fill-secondary-200 stroke-secondary-200 w-2 h-2",
                },
                {
                  variant: "outlined",
                  name: "lg",
                  styles:
                    "p1 border fill-secondary-200 stroke-secondary-200 w-4 h-4",
                },
              ],
            },
            {
              variant: "outlined",
              name: "secondary-200",
              styles:
                "p1 border fill-secondary-200 stroke-secondary-200 w-4 h-4",
              sizes: [
                {
                  variant: "outlined",
                  name: "sm",
                  styles:
                    "p1 border fill-secondary-200 stroke-secondary-200 w-1 h-1",
                },
                {
                  variant: "outlined",
                  name: "md",
                  styles:
                    "p1 border fill-secondary-200 stroke-secondary-200 w-2 h-2",
                },
                {
                  variant: "outlined",
                  name: "lg",
                  styles:
                    "p1 border fill-secondary-200 stroke-secondary-200 w-4 h-4",
                },
              ],
            },
            {
              variant: "outlined",
              name: "tertiary",
              styles: "p1 border fill-tertiary stroke-tertiary w-4 h-4",
              sizes: [
                {
                  variant: "outlined",
                  name: "sm",
                  styles: "p1 border fill-tertiary stroke-tertiary w-1 h-1",
                },
                {
                  variant: "outlined",
                  name: "md",
                  styles: "p1 border fill-tertiary stroke-tertiary w-2 h-2",
                },
                {
                  variant: "outlined",
                  name: "lg",
                  styles: "p1 border fill-tertiary stroke-tertiary w-4 h-4",
                },
              ],
            },
            {
              variant: "outlined",
              name: "tertiary-500",
              styles: "p1 border fill-tertiary-500 stroke-tertiary-500 w-4 h-4",
              sizes: [
                {
                  variant: "outlined",
                  name: "sm",
                  styles:
                    "p1 border fill-tertiary-500 stroke-tertiary-500 w-1 h-1",
                },
                {
                  variant: "outlined",
                  name: "md",
                  styles:
                    "p1 border fill-tertiary-500 stroke-tertiary-500 w-2 h-2",
                },
                {
                  variant: "outlined",
                  name: "lg",
                  styles:
                    "p1 border fill-tertiary-500 stroke-tertiary-500 w-4 h-4",
                },
              ],
            },
            {
              variant: "outlined",
              name: "quaternary",
              styles: "p1 border fill-quaternary stroke-quaternary w-4 h-4",
              sizes: [
                {
                  variant: "outlined",
                  name: "sm",
                  styles: "p1 border fill-quaternary stroke-quaternary w-1 h-1",
                },
                {
                  variant: "outlined",
                  name: "md",
                  styles: "p1 border fill-quaternary stroke-quaternary w-2 h-2",
                },
                {
                  variant: "outlined",
                  name: "lg",
                  styles: "p1 border fill-quaternary stroke-quaternary w-4 h-4",
                },
              ],
            },
          ],
        },
        {
          variant: "filled",
          name: "default",
          styles: "p1 center fill-tertiary-500 stroke-tertiary-500 w-4 h-4",
          colors: [
            {
              variant: "filled",
              name: "primary",
              styles: "p1 center fill-primary-500 stroke-primary-500 w-4 h-4",
              sizes: [
                {
                  variant: "filled",
                  name: "sm",
                  styles:
                    "p1 center fill-primary-500 stroke-primary-500 w-1 h-1",
                },
                {
                  variant: "filled",
                  name: "md",
                  styles:
                    "p1 center fill-primary-500 stroke-primary-500 w-2 h-2",
                },
                {
                  variant: "filled",
                  name: "lg",
                  styles:
                    "p1 center fill-primary-500 stroke-primary-500 w-4 h-4",
                },
              ],
            },
            {
              variant: "filled",
              name: "primary-500",
              styles: "p1 center fill-primary-500 stroke-primary-500 w-4 h-4",
              sizes: [
                {
                  variant: "filled",
                  name: "sm",
                  styles:
                    "p1 center fill-primary-500 stroke-primary-500 w-1 h-1",
                },
                {
                  variant: "filled",
                  name: "md",
                  styles:
                    "p1 center fill-primary-500 stroke-primary-500 w-2 h-2",
                },
                {
                  variant: "filled",
                  name: "lg",
                  styles:
                    "p1 center fill-primary-500 stroke-primary-500 w-4 h-4",
                },
              ],
            },
            {
              variant: "filled",
              name: "secondary",
              styles:
                "p1 center fill-secondary-200 stroke-secondary-200 w-4 h-4",
              sizes: [
                {
                  variant: "filled",
                  name: "sm",
                  styles:
                    "p1 center fill-secondary-200 stroke-secondary-200 w-1 h-1",
                },
                {
                  variant: "filled",
                  name: "md",
                  styles:
                    "p1 center fill-secondary-200 stroke-secondary-200 w-2 h-2",
                },
                {
                  variant: "filled",
                  name: "lg",
                  styles:
                    "p1 center fill-secondary-200 stroke-secondary-200 w-4 h-4",
                },
              ],
            },
            {
              variant: "filled",
              name: "secondary-200",
              styles:
                "p1 center fill-secondary-200 stroke-secondary-200 w-4 h-4",
              sizes: [
                {
                  variant: "filled",
                  name: "sm",
                  styles:
                    "p1 center fill-secondary-200 stroke-secondary-200 w-1 h-1",
                },
                {
                  variant: "filled",
                  name: "md",
                  styles:
                    "p1 center fill-secondary-200 stroke-secondary-200 w-2 h-2",
                },
                {
                  variant: "filled",
                  name: "lg",
                  styles:
                    "p1 center fill-secondary-200 stroke-secondary-200 w-4 h-4",
                },
              ],
            },
            {
              variant: "filled",
              name: "tertiary",
              styles: "p1 center fill-tertiary stroke-tertiary w-4 h-4",
              sizes: [
                {
                  variant: "filled",
                  name: "sm",
                  styles: "p1 center fill-tertiary stroke-tertiary w-1 h-1",
                },
                {
                  variant: "filled",
                  name: "md",
                  styles: "p1 center fill-tertiary stroke-tertiary w-2 h-2",
                },
                {
                  variant: "filled",
                  name: "lg",
                  styles: "p1 center fill-tertiary stroke-tertiary w-4 h-4",
                },
              ],
            },
            {
              variant: "filled",
              name: "tertiary-500",
              styles: "p1 center fill-tertiary-500 stroke-tertiary-500 w-4 h-4",
              sizes: [
                {
                  variant: "filled",
                  name: "sm",
                  styles:
                    "p1 center fill-tertiary-500 stroke-tertiary-500 w-1 h-1",
                },
                {
                  variant: "filled",
                  name: "md",
                  styles:
                    "p1 center fill-tertiary-500 stroke-tertiary-500 w-2 h-2",
                },
                {
                  variant: "filled",
                  name: "lg",
                  styles:
                    "p1 center fill-tertiary-500 stroke-tertiary-500 w-4 h-4",
                },
              ],
            },
            {
              variant: "filled",
              name: "quaternary",
              styles: "p1 center fill-quaternary stroke-quaternary w-4 h-4",
              sizes: [
                {
                  variant: "filled",
                  name: "sm",
                  styles: "p1 center fill-quaternary stroke-quaternary w-1 h-1",
                },
                {
                  variant: "filled",
                  name: "md",
                  styles: "p1 center fill-quaternary stroke-quaternary w-2 h-2",
                },
                {
                  variant: "filled",
                  name: "lg",
                  styles: "p1 center fill-quaternary stroke-quaternary w-4 h-4",
                },
              ],
            },
          ],
        },
      ],
      sizes: [
        {
          variant: "outlined",
          name: "sm",
          styles: "p1 border fill-tertiary-500 stroke-tertiary-500 w-1 h-1",
        },
        {
          variant: "outlined",
          name: "md",
          styles: "p1 border fill-tertiary-500 stroke-tertiary-500 w-2 h-2",
        },
        {
          variant: "outlined",
          name: "lg",
          styles: "p1 border fill-tertiary-500 stroke-tertiary-500 w-4 h-4",
        },
        {
          variant: "filled",
          name: "sm",
          styles: "p1 center fill-tertiary-500 stroke-tertiary-500 w-1 h-1",
        },
        {
          variant: "filled",
          name: "md",
          styles: "p1 center fill-tertiary-500 stroke-tertiary-500 w-2 h-2",
        },
        {
          variant: "filled",
          name: "lg",
          styles: "p1 center fill-tertiary-500 stroke-tertiary-500 w-4 h-4",
        },
      ],
    };

    const overrideExpectations = {
      name: "Override",
      config: {
        icon: {
          default: "secondary-sm",
          sizes: {
            sm: "w-1 h-1",
            md: "w-2 h-2",
          },
        },
      },
      variants: [
        {
          variant: "outlined",
          name: "default",
          styles: "fill-secondary-200 stroke-secondary-200 w-1 h-1",
          colors: [
            {
              variant: "outlined",
              name: "primary",
              styles: "fill-primary-500 stroke-primary-500 w-1 h-1",
              sizes: [
                {
                  variant: "outlined",
                  name: "sm",
                  styles: "fill-primary-500 stroke-primary-500 w-1 h-1",
                },
                {
                  variant: "outlined",
                  name: "md",
                  styles: "fill-primary-500 stroke-primary-500 w-2 h-2",
                },
              ],
            },
            {
              variant: "outlined",
              name: "primary-500",
              styles: "fill-primary-500 stroke-primary-500 w-1 h-1",
              sizes: [
                {
                  variant: "outlined",
                  name: "sm",
                  styles: "fill-primary-500 stroke-primary-500 w-1 h-1",
                },
                {
                  variant: "outlined",
                  name: "md",
                  styles: "fill-primary-500 stroke-primary-500 w-2 h-2",
                },
              ],
            },
            {
              variant: "outlined",
              name: "secondary",
              styles: "fill-secondary-200 stroke-secondary-200 w-1 h-1",
              sizes: [
                {
                  variant: "outlined",
                  name: "sm",
                  styles: "fill-secondary-200 stroke-secondary-200 w-1 h-1",
                },
                {
                  variant: "outlined",
                  name: "md",
                  styles: "fill-secondary-200 stroke-secondary-200 w-2 h-2",
                },
              ],
            },
            {
              variant: "outlined",
              name: "secondary-200",
              styles: "fill-secondary-200 stroke-secondary-200 w-1 h-1",
              sizes: [
                {
                  variant: "outlined",
                  name: "sm",
                  styles: "fill-secondary-200 stroke-secondary-200 w-1 h-1",
                },
                {
                  variant: "outlined",
                  name: "md",
                  styles: "fill-secondary-200 stroke-secondary-200 w-2 h-2",
                },
              ],
            },
            {
              variant: "outlined",
              name: "tertiary",
              styles: "fill-tertiary stroke-tertiary w-1 h-1",
              sizes: [
                {
                  variant: "outlined",
                  name: "sm",
                  styles: "fill-tertiary stroke-tertiary w-1 h-1",
                },
                {
                  variant: "outlined",
                  name: "md",
                  styles: "fill-tertiary stroke-tertiary w-2 h-2",
                },
              ],
            },
            {
              variant: "outlined",
              name: "tertiary-500",
              styles: "fill-tertiary-500 stroke-tertiary-500 w-1 h-1",
              sizes: [
                {
                  variant: "outlined",
                  name: "sm",
                  styles: "fill-tertiary-500 stroke-tertiary-500 w-1 h-1",
                },
                {
                  variant: "outlined",
                  name: "md",
                  styles: "fill-tertiary-500 stroke-tertiary-500 w-2 h-2",
                },
              ],
            },
            {
              variant: "outlined",
              name: "quaternary",
              styles: "fill-quaternary stroke-quaternary w-1 h-1",
              sizes: [
                {
                  variant: "outlined",
                  name: "sm",
                  styles: "fill-quaternary stroke-quaternary w-1 h-1",
                },
                {
                  variant: "outlined",
                  name: "md",
                  styles: "fill-quaternary stroke-quaternary w-2 h-2",
                },
              ],
            },
          ],
        },
        {
          variant: "filled",
          name: "default",
          styles: "fill-secondary-200 stroke-secondary-200 w-1 h-1",
          colors: [
            {
              variant: "filled",
              name: "primary",
              styles: "fill-primary-500 stroke-primary-500 w-1 h-1",
              sizes: [
                {
                  variant: "filled",
                  name: "sm",
                  styles: "fill-primary-500 stroke-primary-500 w-1 h-1",
                },
                {
                  variant: "filled",
                  name: "md",
                  styles: "fill-primary-500 stroke-primary-500 w-2 h-2",
                },
              ],
            },
            {
              variant: "filled",
              name: "primary-500",
              styles: "fill-primary-500 stroke-primary-500 w-1 h-1",
              sizes: [
                {
                  variant: "filled",
                  name: "sm",
                  styles: "fill-primary-500 stroke-primary-500 w-1 h-1",
                },
                {
                  variant: "filled",
                  name: "md",
                  styles: "fill-primary-500 stroke-primary-500 w-2 h-2",
                },
              ],
            },
            {
              variant: "filled",
              name: "secondary",
              styles: "fill-secondary-200 stroke-secondary-200 w-1 h-1",
              sizes: [
                {
                  variant: "filled",
                  name: "sm",
                  styles: "fill-secondary-200 stroke-secondary-200 w-1 h-1",
                },
                {
                  variant: "filled",
                  name: "md",
                  styles: "fill-secondary-200 stroke-secondary-200 w-2 h-2",
                },
              ],
            },
            {
              variant: "filled",
              name: "secondary-200",
              styles: "fill-secondary-200 stroke-secondary-200 w-1 h-1",
              sizes: [
                {
                  variant: "filled",
                  name: "sm",
                  styles: "fill-secondary-200 stroke-secondary-200 w-1 h-1",
                },
                {
                  variant: "filled",
                  name: "md",
                  styles: "fill-secondary-200 stroke-secondary-200 w-2 h-2",
                },
              ],
            },
            {
              variant: "filled",
              name: "tertiary",
              styles: "fill-tertiary stroke-tertiary w-1 h-1",
              sizes: [
                {
                  variant: "filled",
                  name: "sm",
                  styles: "fill-tertiary stroke-tertiary w-1 h-1",
                },
                {
                  variant: "filled",
                  name: "md",
                  styles: "fill-tertiary stroke-tertiary w-2 h-2",
                },
              ],
            },
            {
              variant: "filled",
              name: "tertiary-500",
              styles: "fill-tertiary-500 stroke-tertiary-500 w-1 h-1",
              sizes: [
                {
                  variant: "filled",
                  name: "sm",
                  styles: "fill-tertiary-500 stroke-tertiary-500 w-1 h-1",
                },
                {
                  variant: "filled",
                  name: "md",
                  styles: "fill-tertiary-500 stroke-tertiary-500 w-2 h-2",
                },
              ],
            },
            {
              variant: "filled",
              name: "quaternary",
              styles: "fill-quaternary stroke-quaternary w-1 h-1",
              sizes: [
                {
                  variant: "filled",
                  name: "sm",
                  styles: "fill-quaternary stroke-quaternary w-1 h-1",
                },
                {
                  variant: "filled",
                  name: "md",
                  styles: "fill-quaternary stroke-quaternary w-2 h-2",
                },
              ],
            },
          ],
        },
      ],
      sizes: [
        {
          variant: "outlined",
          name: "sm",
          styles: "fill-secondary-200 stroke-secondary-200 w-1 h-1",
        },
        {
          variant: "outlined",
          name: "md",
          styles: "fill-secondary-200 stroke-secondary-200 w-2 h-2",
        },
        {
          variant: "filled",
          name: "sm",
          styles: "fill-secondary-200 stroke-secondary-200 w-1 h-1",
        },
        {
          variant: "filled",
          name: "md",
          styles: "fill-secondary-200 stroke-secondary-200 w-2 h-2",
        },
      ],
    };

    describe("Theme tests", () => {
      describe.each([
        baseExpectations,
        extendingExpectations,
        overrideExpectations,
      ])(
        "$name mapping config",
        ({
          config: customConfig,
          variants: expectedVariants,
          sizes: expectedSizes,
        }) => {
          let variants: StyleHandler[];
          let sizes: StyleHandler[];

          beforeAll(() => {
            const spyConfig = jest.fn<Config>(((request: string) =>
              request === "components" ? customConfig : { colors }) as Config);
            //@ts-expect-error Config type enforcement
            const config = configHandler(spyConfig);
            const theme = config("icon", baseConfig);
            variants = theme.variants();
            sizes = theme.sizes();
          });

          describe("Variant mapping", () => {
            describe.each(expectedVariants)(
              "$name variant mapping",
              ({ name, styles, colors }) => {
                let variant: StyleHandler;
                let variantColors: StyleHandler[];

                beforeAll(() => {
                  variant = variants.shift()!;
                  variantColors = variant.options();
                });

                test(`Should map variant ${name}`, () => {
                  expect(variant.name()).toBe(name);
                  expect(variant.styles()).toBe(styles);
                });

                describe.each(colors)(
                  "$name color mapping",
                  ({ name, styles, sizes }) => {
                    let color: StyleHandler;
                    let colorSizes: StyleHandler[];

                    beforeAll(() => {
                      color = variantColors.shift()!;
                      colorSizes = color.options();
                    });

                    test(`Should map color ${name}`, () => {
                      expect(color.name()).toBe(name);
                      expect(color.styles()).toBe(styles);
                    });

                    describe.each(sizes)(
                      "$name size mapping",
                      ({ name, styles }) => {
                        let size: StyleHandler;

                        beforeAll(() => {
                          size = colorSizes.shift()!;
                        });

                        test(`Should map size ${name}`, () => {
                          expect(size.name()).toBe(name);
                          expect(size.styles()).toBe(styles);
                        });
                      }
                    );
                  }
                );
              }
            );
          });
          describe("Size mapping", () => {
            describe.each(expectedSizes)(
              "$name size mapping",
              ({ name, styles }) => {
                let size: StyleHandler;

                beforeAll(() => {
                  size = sizes.shift()!;
                });

                test(`Should map size ${name}`, () => {
                  expect(size.name()).toBe(name);
                  expect(size.styles()).toBe(styles);
                });
              }
            );
          });
        }
      );
    });
  });
});
