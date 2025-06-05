import { z } from "zod";
import {
  buildGlobalExclusion,
  buildKeywordOptionsSchema,
  validKeywordSchema,
} from "./build-schema";
import { keywordOptionsSchema, readerOptionsSchema } from "./base-schema";

export type Pattern = z.infer<typeof validKeywordSchema>;

export type KeywordOptions = z.infer<typeof keywordOptionsSchema>;
export type BuildKeywordOptionsRegex = z.infer<
  typeof buildKeywordOptionsSchema
>;

export type PageExclusion = z.infer<typeof buildGlobalExclusion>;
export type ReaderOptions = z.infer<typeof readerOptionsSchema>;

