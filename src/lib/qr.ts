import QRCode from "qrcode";

/**
 * Generates a QR code PNG data URL encoding a unit reference, for a printable
 * label. Each physical unit gets its own code (never shared across a model) —
 * margin follows the QR spec's recommended quiet zone so it stays reliably
 * scannable at small printed sizes.
 */
export async function generateUnitQrDataUrl(unitRef: string): Promise<string> {
  return QRCode.toDataURL(unitRef, {
    margin: 4,
    width: 480,
    color: { dark: "#1c1712", light: "#00000000" },
  });
}
