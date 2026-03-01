export interface Point {
  x: number;
  y: number;
}

export interface ColorRGB {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function getPixelColor(
  imageData: ImageData,
  x: number,
  y: number
): ColorRGB {
  const index = (y * imageData.width + x) * 4;
  return {
    r: imageData.data[index],
    g: imageData.data[index + 1],
    b: imageData.data[index + 2],
    a: imageData.data[index + 3],
  };
}

export function setPixelColor(
  imageData: ImageData,
  x: number,
  y: number,
  color: ColorRGB
): void {
  const index = (y * imageData.width + x) * 4;
  imageData.data[index] = color.r;
  imageData.data[index + 1] = color.g;
  imageData.data[index + 2] = color.b;
  imageData.data[index + 3] = color.a;
}

export function colorMatch(color1: ColorRGB, color2: ColorRGB, tolerance: number): boolean {
  const rDiff = Math.abs(color1.r - color2.r);
  const gDiff = Math.abs(color1.g - color2.g);
  const bDiff = Math.abs(color1.b - color2.b);
  const aDiff = Math.abs(color1.a - color2.a);

  return rDiff <= tolerance && gDiff <= tolerance && bDiff <= tolerance && aDiff <= tolerance;
}

export function hexToRgb(hex: string): ColorRGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 255,
      }
    : { r: 0, g: 0, b: 0, a: 255 };
}

export function floodFill(
  imageData: ImageData,
  startX: number,
  startY: number,
  fillColor: ColorRGB,
  tolerance: number = 30
): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const targetColor = getPixelColor(imageData, startX, startY);

  if (colorMatch(targetColor, fillColor, 0)) {
    return imageData;
  }

  const visited = new Set<string>();
  const queue: Point[] = [{ x: startX, y: startY }];

  while (queue.length > 0) {
    const { x, y } = queue.shift()!;
    const key = `${x},${y}`;

    if (visited.has(key)) continue;
    if (x < 0 || x >= width || y < 0 || y >= height) continue;

    const currentColor = getPixelColor(imageData, x, y);

    if (!colorMatch(currentColor, targetColor, tolerance)) continue;

    visited.add(key);
    setPixelColor(imageData, x, y, fillColor);

    queue.push({ x: x + 1, y });
    queue.push({ x: x - 1, y });
    queue.push({ x, y: y + 1 });
    queue.push({ x, y: y - 1 });
  }

  return imageData;
}

export function blendColors(baseColor: ColorRGB, overlayColor: ColorRGB, alpha: number = 0.7): ColorRGB {
  return {
    r: Math.round(baseColor.r * (1 - alpha) + overlayColor.r * alpha),
    g: Math.round(baseColor.g * (1 - alpha) + overlayColor.g * alpha),
    b: Math.round(baseColor.b * (1 - alpha) + overlayColor.b * alpha),
    a: 255,
  };
}
