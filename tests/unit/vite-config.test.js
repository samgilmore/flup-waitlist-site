import { describe, expect, it } from "vitest";
import { resolveBuildInputs } from "../../vite.config.js";

describe("vite build inputs", () => {
  it("includes the hidden admin entry point", () => {
    const inputs = resolveBuildInputs();

    expect(inputs).toHaveProperty("main");
    expect(inputs).toHaveProperty("admin");
    expect(inputs.admin.endsWith("/admin/index.html")).toBe(true);
  });
});
