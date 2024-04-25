import { describe, expect, test } from "@jest/globals";
import { styleToString } from "./style-to-string";

describe("styleToString", () => {
  test("Should use provided color as fill", () => {
    const style = styleToString("filled", {
      color: "#555353",
      fill: "#ffc800",
      fontSize: "16",
      lineHeight: "24",
      paddingBottom: "0",
      paddingLeft: "0",
      paddingRight: "0",
      paddingTop: "0",
      stroke: "#ffc800",
      textAlign: "center"
    });

    expect(style).toBe(
      "{ fill:#555353;fontSize:16;lineHeight:24;paddingBottom:0;paddingLeft:0;paddingRight:0;paddingTop:0;textAlign:center; }"
    );
  });
  test("Should use provided color as stroke", () => {
    const style = styleToString("outlined", {
      color: "#555353",
      fill: "#ffc800",
      fontSize: "16",
      lineHeight: "24",
      paddingBottom: "0",
      paddingLeft: "0",
      paddingRight: "0",
      paddingTop: "0",
      stroke: "#ffc800",
      textAlign: "center"
    });

    expect(style).toBe(
      "{ fontSize:16;lineHeight:24;paddingBottom:0;paddingLeft:0;paddingRight:0;paddingTop:0;stroke:#555353;textAlign:center; }"
    );
  });
});
