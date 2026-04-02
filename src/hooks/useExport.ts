import { useState } from "react";
import { toPng } from "html-to-image";

export function useExport(cardRef: React.RefObject<HTMLDivElement | null>) {
  const [exporting, setExporting] = useState(false);

  async function exportImage(): Promise<void> {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "400-scorekeeper.png", { type: "image/png" });

      if (
        typeof navigator.share === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({ files: [file], title: "400 Scorekeeper" });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "400-scorekeeper.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setExporting(false);
    }
  }

  return { exportImage, exporting };
}
