import { describe, expect, it } from "vitest";
import { buildMusicSearchLinks, safeHttpsUrl } from "@/lib/music-links";

describe("external music links", () => {
  it("builds encoded search URLs", () => {
    const links = buildMusicSearchLinks("Super Shy", "NewJeans");
    expect(links.spotify).toBe("https://open.spotify.com/search/Super%20Shy%20NewJeans");
    expect(links.appleMusic).toContain("term=Super%20Shy%20NewJeans");
    expect(links.youtubeMusic).toContain("q=Super%20Shy%20NewJeans");
  });

  it("allows only HTTPS external URLs", () => {
    expect(safeHttpsUrl("https://example.com/image.jpg")).toBe("https://example.com/image.jpg");
    expect(safeHttpsUrl("http://example.com/image.jpg")).toBeNull();
    expect(safeHttpsUrl("javascript:alert(1)")).toBeNull();
  });
});
