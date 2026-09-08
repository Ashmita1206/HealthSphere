import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar/Sidebar";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { name: "Dr. Sarah Mitchell", role: "doctor", email: "sarah@healthsphere.io" },
    logout: vi.fn(),
  }),
}));

describe("F34 Final Polish & OS Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders newly integrated Phase 2 navigation links in Sidebar", () => {
    render(
      <MemoryRouter>
        <Sidebar isOpen={true} onClose={() => {}} />
      </MemoryRouter>
    );

    // Verify key Phase 2 navigation links are in the sidebar
    expect(screen.getAllByText("Doctor Portal").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Telemedicine").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Predictive AI").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Wearables & IoT").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Admin Analytics").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Notifications").length).toBeGreaterThan(0);
  });

  it("verifies PWA manifest configuration", async () => {
    const manifest = await import("../../public/manifest.json");
    expect(manifest.name).toBe("HealthSphere AI Healthcare Operating System");
    expect(manifest.short_name).toBe("HealthSphere");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.theme_color).toBe("#0d9488");
    expect(manifest.icons.length).toBeGreaterThan(0);
  });
});
