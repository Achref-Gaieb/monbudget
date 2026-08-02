import { ImageResponse } from "next/og";

export const alt = "MonBudget — Gestion de budget 50/30/20";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social preview card. Rendered at build time — plain values only, no CSS variables. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #ffffff 0%, #eef2ff 55%, #fce7f3 100%)",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "linear-gradient(135deg, #6366f1, #ec4899)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 999,
                border: "9px solid #ffffff",
              }}
            />
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, color: "#111827" }}>
            MonBudget
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.1,
              maxWidth: 900,
            }}
          >
            Prenez le contrôle de votre argent simplement.
          </div>
          <div style={{ fontSize: 30, color: "#4b5563", maxWidth: 860 }}>
            Répartissez vos revenus, suivez vos dépenses et atteignez vos objectifs
            financiers.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {[
            { label: "Besoins 50%", color: "#6366f1" },
            { label: "Plaisirs 30%", color: "#ec4899" },
            { label: "Épargne 20%", color: "#10b981" },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 22px",
                borderRadius: 999,
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                fontSize: 24,
                color: "#374151",
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: item.color,
                }}
              />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
