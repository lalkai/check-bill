import assert from "node:assert";
import { test } from "node:test";
import { hexToRgb } from "../theme.js";

test("hexToRgb converts standard hex strings", () => {
  const red = hexToRgb("#ff0000");
  assert.deepEqual(red, { r: 255, g: 0, b: 0 });
  
  const shortBlue = hexToRgb("#06c");
  assert.deepEqual(shortBlue, { r: 0, g: 102, b: 204 });
});
