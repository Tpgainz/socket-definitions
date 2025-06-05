import { z } from "zod";


export const CASSE = /\(\?i\)/;
export const PRECISION = /\(\?#(\d+)\)/;
export const GLOBAL_EXCLUSION = /(?<!\()!!/;
export const LOCAL_EXCLUSION = /\(\!\!\)/;
export const Y = /y=(\d+)/;
export const FONT_HEIGHT = /FontHeight=(\d+)/;
export const CHAR_EXCLUSION = /exclude=\{([^}]+)\}/;
export const MIN_PATTERN_LENGTH = 3; // DEFAULT_WORD_LENGTH=3 du global
export const MAX_Y = "max";

export const keywordOptionsSchema = z.object({
  pattern: z
    .string()
    .min(MIN_PATTERN_LENGTH, { message: `pattern must be at least ${MIN_PATTERN_LENGTH} characters` }),
  casse: z.boolean().default(false),
  precision: z.number().min(50).max(100).default(100),
  globalExclusion: z.boolean().default(false),
  localExclusion: z.boolean().default(false),
});


export const readerOptionsSchema = z.object({
  y: z.union([z.literal(MAX_Y), z.number()]).default(MAX_Y),
  fontHeight: z.number().default(10),
  charExclusion: z.string().optional(),
});

export const keywordSchema = z.object({
  ...keywordOptionsSchema.shape,
  ...readerOptionsSchema.shape,
});
