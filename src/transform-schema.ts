import { z } from "zod";
import { keywordOptionsSchema, MAX_Y, readerOptionsSchema } from "./base-schema";
import {
  CASSE,
  GLOBAL_EXCLUSION,
  LOCAL_EXCLUSION,
  PRECISION,
  Y,
  FONT_HEIGHT,
  CHAR_EXCLUSION,
} from "./base-schema";

export const stringToKeywordOptions = z.preprocess((input: unknown) => {
  if (typeof input !== "string") {
    return {};
  }

  const result: Partial<z.infer<typeof keywordOptionsSchema>> = {};

  if (CASSE.test(input)) {
    result.casse = true;
  }

  const precisionMatch = input.match(PRECISION);
  if (precisionMatch) {
    result.precision = Number(precisionMatch[1]) || 100;
  }

  if (GLOBAL_EXCLUSION.test(input)) {
    result.globalExclusion = true;
  }

  if (LOCAL_EXCLUSION.test(input)) {
    result.localExclusion = true;
  }

  result.pattern = input
    .replace(CASSE, "")
    .replace(PRECISION, "")
    .replace(GLOBAL_EXCLUSION, "")
    .replace(LOCAL_EXCLUSION, "")
    .trim();

  return result;
}, z.object(keywordOptionsSchema.shape));

export const stringToReaderOptions = z.preprocess((input: unknown) => {
  if (typeof input !== "string") {
    return {};
  }

  const result: Partial<z.infer<typeof readerOptionsSchema>> = {};

  const fontHeightMatch = input.match(FONT_HEIGHT);
  if (fontHeightMatch) {
    result.fontHeight = Number(fontHeightMatch[1]);
  }

  const yMatch = input.match(Y);
  if (yMatch) {
    const yValue = yMatch[1];
    result.y = yValue === MAX_Y ? MAX_Y : Number(yValue);
  }

  const charExclusionMatch = input.match(CHAR_EXCLUSION);
  if (charExclusionMatch) {
    result.charExclusion = charExclusionMatch[1];
  }

  return result;
}, z.object(readerOptionsSchema.shape));

export const stringToKeyword = z.preprocess((input: unknown) => {
  if (typeof input !== "string") {
    return {};
  }

  if (input.startsWith("[")) {
    return stringToReaderOptions.parse(input);
  }

  return stringToKeywordOptions.parse(input);
}, z.union([z.object(keywordOptionsSchema.shape), z.object(readerOptionsSchema.shape)]));

export const parseOptionsToString = z
  .union([
    z.object(keywordOptionsSchema.shape),
    z.object(readerOptionsSchema.shape),
  ])
  .transform((obj) => {
    const parts: string[] = [];

    if (
      "y" in obj ||
      "fontHeight" in obj ||
      "charExclusion" in obj ||
      Object.keys(obj).length === 0
    ) {
      if ("fontHeight" in obj && obj.fontHeight) {
        parts.push(`FontHeight=${obj.fontHeight.toString()}`);
      }
      if ("y" in obj && obj.y) {
        parts.push(`y=${obj.y.toString()}`);
      }
      if ("charExclusion" in obj && obj.charExclusion) {
        parts.push(`exclude={${obj.charExclusion}}`);
      }
      return `[${parts.join(",")}]`;
    }

    if (obj.globalExclusion) {
      parts.push("!!");
      if (obj.casse) {
        parts.push("(?i)");
      }
      if (obj.pattern) {
        parts.push(obj.pattern);
      }
      return parts.join("");
    }

    if (obj.localExclusion) {
      parts.push("(!!)");
    }
    if (obj.precision && obj.precision !== 100) {
      parts.push(`(?#${obj.precision})`);
    }
    if (obj.casse) {
      parts.push("(?i)");
    }
    if (obj.pattern) {
      parts.push(obj.pattern);
    }

    return parts.join("");
  });
