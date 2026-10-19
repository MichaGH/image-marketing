// Bitmap font for the LED matrix. Glyphs are drawn the way real sign controllers
// store them: a 5x7 cap grid, 2 descender rows and 3 rows above for Slovak accents.

export type LedColorName =
  | "red"
  | "amber"
  | "yellow"
  | "green"
  | "white"
  | "blue";

export const LED_COLOR_NAMES: LedColorName[] = [
  "red",
  "amber",
  "yellow",
  "green",
  "white",
  "blue",
];

/** A monochrome-per-pixel image: 0 = off, n = LED_COLOR_NAMES[n - 1]. */
export type Bitmap = {
  w: number;
  h: number;
  data: Uint8Array;
  /** Column where each visible character ends, for char-by-char reveals. */
  stops: number[];
  /** Line index of each stop and the row pitch between lines (multi-line text). */
  lineOf?: number[];
  linePitch?: number;
};

export type TextSegment = { text: string; color?: LedColorName };

/** Rows above the cap line reserved for accents on capitals. */
const ACCENT_ROWS = 3;
/** Total rows of one line at scale 1: accents + 7 cap rows + 2 descender rows. */
export const LINE_ROWS = ACCENT_ROWS + 7 + 2;
export const CAP_TOP = ACCENT_ROWS;
export const CAP_ROWS = 7;

// prettier-ignore
const GLYPHS: Record<string, string> = {
  A: ".###.|#...#|#...#|#####|#...#|#...#|#...#",
  B: "####.|#...#|#...#|####.|#...#|#...#|####.",
  C: ".###.|#...#|#....|#....|#....|#...#|.###.",
  D: "###..|#..#.|#...#|#...#|#...#|#..#.|###..",
  E: "#####|#....|#....|####.|#....|#....|#####",
  F: "#####|#....|#....|####.|#....|#....|#....",
  G: ".###.|#...#|#....|#.###|#...#|#...#|.####",
  H: "#...#|#...#|#...#|#####|#...#|#...#|#...#",
  I: "###|.#.|.#.|.#.|.#.|.#.|###",
  J: "..###|...#.|...#.|...#.|...#.|#..#.|.##..",
  K: "#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#",
  L: "#....|#....|#....|#....|#....|#....|#####",
  M: "#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#",
  N: "#...#|#...#|##..#|#.#.#|#..##|#...#|#...#",
  O: ".###.|#...#|#...#|#...#|#...#|#...#|.###.",
  P: "####.|#...#|#...#|####.|#....|#....|#....",
  Q: ".###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#",
  R: "####.|#...#|#...#|####.|#.#..|#..#.|#...#",
  S: ".####|#....|#....|.###.|....#|....#|####.",
  T: "#####|..#..|..#..|..#..|..#..|..#..|..#..",
  U: "#...#|#...#|#...#|#...#|#...#|#...#|.###.",
  V: "#...#|#...#|#...#|#...#|#...#|.#.#.|..#..",
  W: "#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.",
  X: "#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#",
  Y: "#...#|#...#|#...#|.#.#.|..#..|..#..|..#..",
  Z: "#####|....#|...#.|..#..|.#...|#....|#####",
  "Ľ": "#..#.|#..#.|#....|#....|#....|#....|#####",

  a: ".....|.....|.###.|....#|.####|#...#|.####",
  b: "#....|#....|#.##.|##..#|#...#|#...#|####.",
  c: ".....|.....|.###.|#....|#....|#...#|.###.",
  d: "....#|....#|.##.#|#..##|#...#|#...#|.####",
  e: ".....|.....|.###.|#...#|#####|#....|.###.",
  f: "..##|.#..|####|.#..|.#..|.#..|.#..",
  g: ".....|.....|.####|#...#|#...#|#...#|.####|....#|.###.",
  h: "#....|#....|#.##.|##..#|#...#|#...#|#...#",
  i: ".#.|...|##.|.#.|.#.|.#.|###",
  "ı": "...|...|##.|.#.|.#.|.#.|###",
  j: "...#|....|..##|...#|...#|...#|...#|#..#|.##.",
  k: "#...|#...|#..#|#.#.|##..|#.#.|#..#",
  l: "##.|.#.|.#.|.#.|.#.|.#.|###",
  m: ".....|.....|##.#.|#.#.#|#.#.#|#...#|#...#",
  n: ".....|.....|#.##.|##..#|#...#|#...#|#...#",
  o: ".....|.....|.###.|#...#|#...#|#...#|.###.",
  p: ".....|.....|####.|#...#|#...#|#...#|####.|#....|#....",
  q: ".....|.....|.####|#...#|#...#|#...#|.####|....#|....#",
  r: ".....|.....|#.##.|##..#|#....|#....|#....",
  s: ".....|.....|.####|#....|.###.|....#|####.",
  t: ".#..|.#..|####|.#..|.#..|.#..|..##",
  u: ".....|.....|#...#|#...#|#...#|#..##|.##.#",
  v: ".....|.....|#...#|#...#|#...#|.#.#.|..#..",
  w: ".....|.....|#...#|#...#|#.#.#|#.#.#|.#.#.",
  x: ".....|.....|#...#|.#.#.|..#..|.#.#.|#...#",
  y: ".....|.....|#...#|#...#|#...#|#...#|.####|....#|.###.",
  z: ".....|.....|#####|...#.|..#..|.#...|#####",
  "ď": "....#.#|....#.#|.##.#..|#..##..|#...#..|#...#..|.####..",
  "ľ": "##.#|.#.#|.#..|.#..|.#..|.#..|###.",
  "ť": ".#..#|.#..#|####.|.#...|.#...|.#...|..##.",

  "0": ".###.|#...#|#..##|#.#.#|##..#|#...#|.###.",
  "1": ".#.|##.|.#.|.#.|.#.|.#.|###",
  "2": ".###.|#...#|....#|...#.|..#..|.#...|#####",
  "3": "#####|...#.|..#..|...#.|....#|#...#|.###.",
  "4": "...#.|..##.|.#.#.|#..#.|#####|...#.|...#.",
  "5": "#####|#....|####.|....#|....#|#...#|.###.",
  "6": "..##.|.#...|#....|####.|#...#|#...#|.###.",
  "7": "#####|....#|...#.|..#..|.#...|.#...|.#...",
  "8": ".###.|#...#|#...#|.###.|#...#|#...#|.###.",
  "9": ".###.|#...#|#...#|.####|....#|...#.|.##..",

  " ": "...|...|...|...|...|...|...",
  ".": ".|.|.|.|.|.|#",
  ",": "..|..|..|..|..|.#|.#|#.",
  ":": ".|.|#|.|.|#|.",
  ";": "..|..|.#|..|..|.#|.#|#.",
  "!": "#|#|#|#|#|.|#",
  "?": ".###.|#...#|....#|...#.|..#..|.....|..#..",
  "-": "....|....|....|####|....|....|....",
  "+": ".....|..#..|..#..|#####|..#..|..#..|.....",
  "=": "....|....|####|....|####|....|....",
  "/": "....#|....#|...#.|..#..|.#...|#....|#....",
  "'": "#|#|.|.|.|.|.",
  '"': "#.#|#.#|...|...|...|...|...",
  "(": "..#|.#.|#..|#..|#..|.#.|..#",
  ")": "#..|.#.|..#|..#|..#|.#.|#..",
  "%": "##..#|##..#|...#.|..#..|.#...|#..##|#..##",
  "&": ".##..|#..#.|#.#..|.#...|#.#.#|#..#.|.##.#",
  "€": "..###|.#...|####.|.#...|####.|.#...|..###",
  "@": ".###.|#...#|#.###|#.#.#|#.###|#....|.###.",
  "#": ".#.#.|.#.#.|#####|.#.#.|#####|.#.#.|.#.#.",
  "*": ".....|#.#.#|.###.|#####|.###.|#.#.#|.....",
  "_": ".....|.....|.....|.....|.....|.....|.....|#####",
  "<": "...#|..#.|.#..|#...|.#..|..#.|...#",
  ">": "#...|.#..|..#.|...#|..#.|.#..|#...",
  "•": "...|...|.#.|###|.#.|...|...",
  "→": "......|...#..|....#.|######|....#.|...#..|......",
  "♥": ".....|##.##|#####|#####|.###.|..#..|.....",
};

const ACCENTS: Record<string, string[]> = {
  acute: ["..#", ".#."],
  caron: ["#.#", ".#."],
  circumflex: [".#.", "#.#"],
  diaeresis: ["...", "#.#"],
};

const COMPOSED: Record<string, [string, keyof typeof ACCENTS]> = {
  "Á": ["A", "acute"], "Ä": ["A", "diaeresis"], "Č": ["C", "caron"],
  "Ď": ["D", "caron"], "É": ["E", "acute"], "Ě": ["E", "caron"],
  "Í": ["I", "acute"], "Ĺ": ["L", "acute"], "Ň": ["N", "caron"],
  "Ó": ["O", "acute"], "Ô": ["O", "circumflex"], "Ŕ": ["R", "acute"],
  "Ř": ["R", "caron"], "Š": ["S", "caron"], "Ť": ["T", "caron"],
  "Ú": ["U", "acute"], "Ý": ["Y", "acute"], "Ž": ["Z", "caron"],
  "á": ["a", "acute"], "ä": ["a", "diaeresis"], "č": ["c", "caron"],
  "é": ["e", "acute"], "ě": ["e", "caron"], "í": ["ı", "acute"],
  "ĺ": ["l", "acute"], "ň": ["n", "caron"], "ó": ["o", "acute"],
  "ô": ["o", "circumflex"], "ŕ": ["r", "acute"], "ř": ["r", "caron"],
  "š": ["s", "caron"], "ú": ["u", "acute"], "ý": ["y", "acute"],
  "ž": ["z", "caron"],
};

type Glyph = { w: number; rows: boolean[][] }; // LINE_ROWS tall

const cache = new Map<string, Glyph>();

function parse(src: string): Glyph {
  const lines = src.split("|");
  const w = lines[0].length;
  const rows = Array.from({ length: LINE_ROWS }, () =>
    new Array<boolean>(w).fill(false),
  );
  lines.forEach((line, r) => {
    for (let c = 0; c < w; c++) rows[ACCENT_ROWS + r][c] = line[c] === "#";
  });
  return { w, rows };
}

function glyph(ch: string): Glyph {
  const hit = cache.get(ch);
  if (hit) return hit;
  let g: Glyph;
  if (GLYPHS[ch]) g = parse(GLYPHS[ch]);
  else if (COMPOSED[ch]) {
    const [baseCh, accentName] = COMPOSED[ch];
    const base = glyph(baseCh);
    const accent = ACCENTS[accentName];
    g = { w: base.w, rows: base.rows.map((r) => [...r]) };
    // Tall bases (capitals, l) carry the accent above the cap line, x-height letters just above the bowl.
    const tall = base.rows[CAP_TOP].some(Boolean) || base.rows[CAP_TOP + 1].some(Boolean);
    const bottom = tall ? CAP_TOP - 2 : CAP_TOP;
    const x0 = Math.floor((base.w - 1) / 2) - 1;
    accent.forEach((line, i) => {
      const r = bottom - (accent.length - 1 - i);
      for (let c = 0; c < line.length; c++) {
        const x = x0 + c;
        if (line[c] === "#" && x >= 0 && x < g.w) g.rows[r][x] = true;
      }
    });
  } else {
    const upper = ch.toUpperCase();
    g = upper !== ch && (GLYPHS[upper] || COMPOSED[upper]) ? glyph(upper) : parse(GLYPHS["?"]);
  }
  cache.set(ch, g);
  return g;
}

/** Scale2x (EPX): doubles the bitmap and rounds diagonal steps the way large sign fonts do. */
function scale2x(src: Bitmap): Bitmap {
  const { w, h, data } = src;
  const out = new Uint8Array(w * 2 * h * 2);
  const at = (x: number, y: number) =>
    x < 0 || y < 0 || x >= w || y >= h ? 0 : data[y * w + x];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const P = at(x, y);
      const A = at(x, y - 1);
      const B = at(x + 1, y);
      const C = at(x - 1, y);
      const D = at(x, y + 1);
      const e0 = C === A && C !== D && A !== B ? A : P;
      const e1 = A === B && A !== C && B !== D ? B : P;
      const e2 = D === C && D !== B && C !== A ? C : P;
      const e3 = B === D && B !== A && D !== C ? D : P;
      const o = y * 2 * w * 2 + x * 2;
      out[o] = e0;
      out[o + 1] = e1;
      out[o + w * 2] = e2;
      out[o + w * 2 + 1] = e3;
    }
  }
  return { ...src, w: w * 2, h: h * 2, data: out, stops: src.stops.map((s) => s * 2), linePitch: (src.linePitch ?? 0) * 2 };
}

function scaleNearest(src: Bitmap, s: number): Bitmap {
  if (s === 1) return src;
  const w = src.w * s;
  const h = src.h * s;
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      out[y * w + x] = src.data[Math.floor(y / s) * src.w + Math.floor(x / s)];
  return { ...src, w, h, data: out, stops: src.stops.map((v) => v * s), linePitch: (src.linePitch ?? 0) * s };
}

export type PixelTextOptions = {
  /** Integer size multiplier. 2 gives the classic 14-row "HOT-DOG" look. */
  scale?: number;
  /** Round diagonals when scaling up (Scale2x). */
  smooth?: boolean;
  /** Columns between characters, at scale 1. */
  spacing?: number;
  /** Default color for segments that do not set one. */
  color?: LedColorName;
  /** Empty rows between the cap line of one line and the next, at scale 1. */
  lineGap?: number;
  align?: "left" | "center" | "right";
};

function normalize(input: string | TextSegment[]): TextSegment[] {
  return typeof input === "string" ? [{ text: input }] : input;
}

/** Renders text with the built-in sign font. Use "\n" for multiple lines. */
export function renderPixelText(
  input: string | TextSegment[],
  opts: PixelTextOptions = {},
): Bitmap {
  const {
    scale = 1,
    smooth = true,
    spacing = 1,
    color = "red",
    lineGap = 4,
    align = "center",
  } = opts;
  // Split segments into lines of [char, colorIndex].
  const lines: [string, number][][] = [[]];
  for (const seg of normalize(input)) {
    const idx = LED_COLOR_NAMES.indexOf(seg.color ?? color) + 1;
    for (const ch of seg.text) {
      if (ch === "\n") lines.push([]);
      else lines[lines.length - 1].push([ch, idx]);
    }
  }
  const widths = lines.map((line) =>
    line.reduce((sum, [ch], i) => sum + glyph(ch).w + (i ? spacing : 0), 0),
  );
  const w = Math.max(1, ...widths);
  // Lines share accent/descender rows, so a descender only collides with an accented capital below it.
  const linePitch = CAP_ROWS + lineGap;
  const h = (lines.length - 1) * linePitch + LINE_ROWS;
  const data = new Uint8Array(w * h);
  const stops: number[] = [];
  const lineOf: number[] = [];
  lines.forEach((line, li) => {
    let x =
      align === "left" ? 0 : align === "right" ? w - widths[li] : Math.floor((w - widths[li]) / 2);
    const y0 = li * linePitch;
    line.forEach(([ch, idx], i) => {
      if (i) x += spacing;
      const g = glyph(ch);
      for (let r = 0; r < LINE_ROWS; r++)
        for (let c = 0; c < g.w; c++)
          if (g.rows[r][c]) data[(y0 + r) * w + x + c] = idx;
      x += g.w;
      if (ch !== " ") {
        stops.push(x);
        lineOf.push(li);
      }
    });
  });
  const base: Bitmap = { w, h, data, stops, lineOf, linePitch };
  if (scale === 1) return base;
  if (smooth && scale % 2 === 0) return scaleNearest(scale2x(base), scale / 2);
  return scaleNearest(base, scale);
}

/** Row offset that vertically centres the cap height of a pixel-font line on the panel. */
export function centerCapsY(rows: number, scale = 1, lines = 1, lineGap = 4) {
  const capBlock = ((lines - 1) * (CAP_ROWS + lineGap) + CAP_ROWS) * scale;
  return Math.round((rows - capBlock) / 2) - CAP_TOP * scale;
}

/**
 * Rasterises text with any CSS font and thresholds it to LEDs.
 * Good for large logo words (24+ rows); small sizes look better with renderPixelText.
 */
export function renderFontText(
  text: string,
  opts: { font: string; rows: number; color?: LedColorName; threshold?: number; spacing?: number },
): Bitmap {
  const { font, rows, color = "red", threshold = 0.5, spacing = 0 } = opts;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const sized = font.replace(/\d+(\.\d+)?px/, `${rows}px`);
  ctx.font = sized;
  ctx.letterSpacing = `${spacing}px`;
  const m = ctx.measureText(text);
  const w = Math.ceil(m.actualBoundingBoxRight + m.actualBoundingBoxLeft) + 2;
  const top = Math.ceil(m.actualBoundingBoxAscent);
  const h = top + Math.ceil(m.actualBoundingBoxDescent) + 1;
  canvas.width = w;
  canvas.height = h;
  ctx.font = sized;
  ctx.letterSpacing = `${spacing}px`;
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, 1 + m.actualBoundingBoxLeft, top);
  const px = ctx.getImageData(0, 0, w, h).data;
  const idx = LED_COLOR_NAMES.indexOf(color) + 1;
  const data = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) if (px[i * 4 + 3] / 255 >= threshold) data[i] = idx;
  return { w, h, data, stops: [w] };
}

/** Recolours every lit pixel. */
export function tint(bitmap: Bitmap, color: LedColorName): Bitmap {
  const idx = LED_COLOR_NAMES.indexOf(color) + 1;
  return { ...bitmap, data: bitmap.data.map((v) => (v ? idx : 0)) };
}
