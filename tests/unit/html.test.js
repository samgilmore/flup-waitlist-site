import { describe, expect, it } from "vitest";
import { escapeHtml } from "../../src/lib/html.js";

describe("html helpers", () => {
  it("escapes unsafe characters before values are injected into markup", () => {
    expect(escapeHtml(`Sam <script>alert("x")</script> & "friends"`)).toBe(
      "Sam &lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &quot;friends&quot;"
    );
  });
});
