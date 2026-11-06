let promise;
export function loadSkinViewer() {
  if (!promise)
    promise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "./vendor/skinview3d/studio.bundle.js";
      s.onload = () => resolve(window.faSkin3d);
      s.onerror = () => {
        promise = null;
        s.remove();
        reject(
          Error(
            "A prévia 3D não carregou. Você pode continuar pela textura 2D.",
          ),
        );
      };
      document.head.append(s);
    });
  return promise;
}
export function pixelCanvas(pixels) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  c.getContext("2d").putImageData(
    new ImageData(new Uint8ClampedArray(pixels), 64, 64),
    0,
    0,
  );
  return c;
}
export async function imagePixels(src) {
  const img = new Image();
  img.src = src;
  await img.decode();
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0);
  if (img.height === 32) {
    // The official utility performs the legacy layout's mirrored limb conversion.
    const api = await loadSkinViewer();
    api.loadSkinToCanvas(c, img);
  }
  return ctx.getImageData(0, 0, 64, 64).data;
}
export function drawSkinFront(canvas, pixels, model) {
  const c = canvas.getContext("2d"),
    tex = pixelCanvas(pixels),
    a = model === "slim" ? 3 : 4;
  c.clearRect(0, 0, canvas.width, canvas.height);
  c.imageSmoothingEnabled = false;
  c.save();
  c.scale(canvas.width / 96, canvas.height / 128);
  const rows = [
    [8, 8, 8, 8, 32, 0, 32, 32],
    [20, 20, 8, 12, 32, 32, 32, 48],
    [44, 20, a, 12, 32 - a * 4, 32, a * 4, 48],
    [36, 52, a, 12, 64, 32, a * 4, 48],
    [4, 20, 4, 12, 32, 80, 16, 48],
    [20, 52, 4, 12, 48, 80, 16, 48],
    [40, 8, 8, 8, 32, 0, 32, 32],
    [20, 36, 8, 12, 32, 32, 32, 48],
    [44, 36, a, 12, 32 - a * 4, 32, a * 4, 48],
    [52, 52, a, 12, 64, 32, a * 4, 48],
    [4, 36, 4, 12, 32, 80, 16, 48],
    [4, 52, 4, 12, 48, 80, 16, 48],
  ];
  for (const r of rows) c.drawImage(tex, ...r);
  c.restore();
}
