import { z } from "zod";
import { CASSE, GLOBAL_EXCLUSION, keywordSchema, LOCAL_EXCLUSION, PRECISION } from "./base-schema";

export const validKeywordSchema = z.object({
  pattern: keywordSchema.shape.pattern.refine(
    (val) => !val?.includes("|") && !val?.includes("&&"),
    {
      message: "pattern must not contain | or &&",
    }
  ),
});



const casseSchema = z.object({
  casse: keywordSchema.shape.casse.transform((val) => (val ? "(?i)" : null)),
});

const precisionSchema = z.object({
  precision: keywordSchema.shape.precision.transform((val) =>
    val && val !== 100 ? `(?#${val})` : null
  ),
});

const localExclusionSchema = keywordSchema.shape.localExclusion.transform(
  (val) => (val ? `(!!)` : null)
);

export const buildGlobalExclusion = z.object({
  globalExclusion: keywordSchema.shape.localExclusion.transform((val) =>
    val ? "!!" : null
  ),
});

export const buildKeywordOptionsSchema = casseSchema
  .merge(precisionSchema)
  .merge(
    z.object({
      localExclusion: localExclusionSchema,
    })
  ).merge(buildGlobalExclusion).merge(z.object(
    {pattern:keywordSchema.shape.pattern}))

export const buildReaderOptionsSchema = z.object({
  y: keywordSchema.shape.y
    .refine((val) => val === "max" || !isNaN(Number(val)), {
      message: "y must be 'max' or a number",
    })
    .transform((val) => `y=${val ?? "max"}`),

  fontHeight: keywordSchema.shape.fontHeight.transform(
    (val) => `FontHeight=${val ?? 10}`
  ),
  charExclusion: keywordSchema.shape.charExclusion.transform((val) =>
    val ? `exclude={${val}}` : null
  ),
});

export const stringToBuildKeywordOptions = z.preprocess((input: unknown) => {
  // If it's not a string, return an empty object so Zod can fill defaults or fail accordingly
  if (typeof input !== "string") {
    return {};
  }

  const result: Partial<z.infer<typeof keywordSchema>> = {};

  // Check for the global exclusion pattern first
  // 1. GLOBAL_EXCLUSION => is "!!" present => `globalExclusion = true` 
  result.globalExclusion = GLOBAL_EXCLUSION.test(input);

  // Check each pattern just like in stringToKeywordOptions:
  // 2. CASSE => is "(?i)" present => `casse = true`
  result.casse = CASSE.test(input);

  // 3. PRECISION => is "(?#\d+)" present => `precision = <that number>`
  const precisionMatch = input.match(PRECISION);
  if (precisionMatch) {
    result.precision = Number(precisionMatch[1]) || 100;
  } else {
    // fallback to 100 if no precision is found
    result.precision = 100;
  }

  // 4. LOCAL_EXCLUSION => is "(!!)" present => `localExclusion = true`
  result.localExclusion = LOCAL_EXCLUSION.test(input);


  // 5. PATTERN => is the rest of the string
  result.pattern = input
    .replace(CASSE, "")
    .replace(PRECISION, "")
    .replace(GLOBAL_EXCLUSION, "")
    .replace(LOCAL_EXCLUSION, "")
    .trim();

  // Return our object for further validation/transformation by Zod
  return result;
}, buildKeywordOptionsSchema);