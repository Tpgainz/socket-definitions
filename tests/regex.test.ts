import {
  buildKeywordOptionsSchema,
  buildReaderOptionsSchema,
  validKeywordSchema,
} from "../src/build-schema";
import { stringToKeyword, parseOptionsToString, stringToKeywordOptions, stringToReaderOptions } from "../src/transform-schema";

describe("buildKeywordOptionsSchema", () => {
  describe("pattern transformation", () => {
    test("should keep valid pattern unchanged", () => {
      const result = buildKeywordOptionsSchema.parse({ pattern: "keyword" });
      expect(result.pattern).toBe("keyword");
    });

    test("should reject patterns shorter than minimum length", () => {
      expect(() => buildKeywordOptionsSchema.parse({ pattern: "ke" })).toThrow();
    });

    test("should accept patterns at minimum length", () => {
      const result = buildKeywordOptionsSchema.parse({ pattern: "key" });
      expect(result.pattern).toBe("key");
    });
  });

  describe("casse transformation", () => {
    test("should transform true to (?i)", () => {
      const result = buildKeywordOptionsSchema.parse({ pattern: "test", casse: true });
      expect(result.casse).toBe("(?i)");
    });

    test("should transform false to null", () => {
      const result = buildKeywordOptionsSchema.parse({ pattern: "test", casse: false });
      expect(result.casse).toBeNull();
    });

    test("should default to null when not provided", () => {
      const result = buildKeywordOptionsSchema.parse({ pattern: "test" });
      expect(result.casse).toBeNull();
    });
  });

  describe("precision transformation", () => {
    test("should transform valid precision to regex format", () => {
      const result = buildKeywordOptionsSchema.parse({ pattern: "test", precision: 75 });
      expect(result.precision).toBe("(?#75)");
    });

    test("should transform 100 to null (default value)", () => {
      const result = buildKeywordOptionsSchema.parse({ pattern: "test", precision: 100 });
      expect(result.precision).toBeNull();
    });

    test("should reject precision below 50", () => {
      expect(() => buildKeywordOptionsSchema.parse({ pattern: "test", precision: 49 })).toThrow();
    });

    test("should reject precision above 100", () => {
      expect(() => buildKeywordOptionsSchema.parse({ pattern: "test", precision: 101 })).toThrow();
    });

    test("should accept boundary values", () => {
      const result50 = buildKeywordOptionsSchema.parse({ pattern: "test", precision: 50 });
      expect(result50.precision).toBe("(?#50)");
      
      const result100 = buildKeywordOptionsSchema.parse({ pattern: "test", precision: 100 });
      expect(result100.precision).toBeNull();
    });
  });

  describe("exclusion transformations", () => {
    test("should transform localExclusion true to (!!)", () => {
      const result = buildKeywordOptionsSchema.parse({ pattern: "test", localExclusion: true });
      expect(result.localExclusion).toBe("(!!)");
    });

    test("should transform localExclusion false to null", () => {
      const result = buildKeywordOptionsSchema.parse({ pattern: "test", localExclusion: false });
      expect(result.localExclusion).toBeNull();
    });

    test("should transform globalExclusion true to !!", () => {
      const result = buildKeywordOptionsSchema.parse({ pattern: "test", globalExclusion: true });
      expect(result.globalExclusion).toBe("!!");
    });

    test("should transform globalExclusion false to null", () => {
      const result = buildKeywordOptionsSchema.parse({ pattern: "test", globalExclusion: false });
      expect(result.globalExclusion).toBeNull();
    });
  });

  describe("complete transformation", () => {
    test("should handle all options together", () => {
      const result = buildKeywordOptionsSchema.parse({
        casse: true,
        precision: 50,
        localExclusion: true,
        globalExclusion: true,
        pattern: "keyword",
      });
      
      expect(result).toStrictEqual({
        casse: "(?i)",
        precision: "(?#50)",
        localExclusion: "(!!)",
        globalExclusion: "!!",
        pattern: "keyword",
      });
    });

    test("should return empty object for empty input", () => {
      expect(() => buildKeywordOptionsSchema.parse({})).toThrow();
    });
  });
});

describe("buildReaderOptionsSchema", () => {
  describe("y transformation", () => {
    test("should transform 'max' to 'y=max'", () => {
      const result = buildReaderOptionsSchema.parse({ y: "max" });
      expect(result.y).toBe("y=max");
    });

    test("should transform numeric values", () => {
      const result = buildReaderOptionsSchema.parse({ y: 600 });
      expect(result.y).toBe("y=600");
    });

    test("should transform zero", () => {
      const result = buildReaderOptionsSchema.parse({ y: 0 });
      expect(result.y).toBe("y=0");
    });

    test("should reject invalid string values", () => {
      expect(() => buildReaderOptionsSchema.parse({ y: "invalid" })).toThrow();
    });

    test("should use default when not provided", () => {
      const result = buildReaderOptionsSchema.parse({});
      expect(result.y).toBe("y=max");
    });
  });

  describe("fontHeight transformation", () => {
    test("should transform valid font heights", () => {
      const result = buildReaderOptionsSchema.parse({ fontHeight: 12 });
      expect(result.fontHeight).toBe("FontHeight=12");
    });

    test("should use default when not provided", () => {
      const result = buildReaderOptionsSchema.parse({});
      expect(result.fontHeight).toBe("FontHeight=10");
    });

    test("should handle minimum values", () => {
      const result = buildReaderOptionsSchema.parse({ fontHeight: 1 });
      expect(result.fontHeight).toBe("FontHeight=1");
    });
  });

  describe("charExclusion transformation", () => {
    test("should transform valid exclusion strings", () => {
      const result = buildReaderOptionsSchema.parse({ charExclusion: "abc" });
      expect(result.charExclusion).toBe("exclude={abc}");
    });

    test("should handle special characters", () => {
      const result = buildReaderOptionsSchema.parse({ charExclusion: "!@#$" });
      expect(result.charExclusion).toBe("exclude={!@#$}");
    });

    test("should return null when not provided", () => {
      const result = buildReaderOptionsSchema.parse({});
      expect(result.charExclusion).toBeNull();
    });

    test("should handle empty string", () => {
      const result = buildReaderOptionsSchema.parse({ charExclusion: "" });
      expect(result.charExclusion).toBeNull();
    });
  });

  describe("complete transformation", () => {
    test("should handle all options together", () => {
      const result = buildReaderOptionsSchema.parse({
        y: "max",
        fontHeight: 12,
        charExclusion: "abc",
      });
      
      expect(result).toStrictEqual({
        y: "y=max",
        fontHeight: "FontHeight=12",
        charExclusion: "exclude={abc}",
      });
    });
  });
});

describe("validKeywordSchema", () => {
  describe("pattern validation", () => {
    test("should accept simple keywords", () => {
      const result = validKeywordSchema.parse({ pattern: "keyword" });
      expect(result.pattern).toBe("keyword");
    });

    test("should accept patterns with regex elements", () => {
      const result = validKeywordSchema.parse({ pattern: "(?#90)(?i)keyword" });
      expect(result.pattern).toBe("(?#90)(?i)keyword");
    });

    test("should accept patterns with square brackets", () => {
      const result = validKeywordSchema.parse({ pattern: "[FontHeight=12]" });
      expect(result.pattern).toBe("[FontHeight=12]");
    });

    test("should reject patterns with pipe operator", () => {
      expect(() => validKeywordSchema.parse({ pattern: "keyword|other" })).toThrow();
    });

    test("should reject patterns with double ampersand", () => {
      expect(() => validKeywordSchema.parse({ pattern: "keyword&&other" })).toThrow();
    });

    test("should reject complex invalid patterns", () => {
      expect(() => validKeywordSchema.parse({ pattern: "(?#90)keyword|(?i)keyword" })).toThrow();
      expect(() => validKeywordSchema.parse({ pattern: "(?#90)keyword&&(?i)keyword" })).toThrow();
    });
  });
});

describe("stringToKeywordOptions", () => {
  test("should parse simple pattern", () => {
    const result = stringToKeywordOptions.parse("keyword");
    expect(result).toStrictEqual({
      pattern: "keyword",
      casse: false,
      precision: 100,
      globalExclusion: false,
      localExclusion: false,
    });
  });

  test("should parse case insensitive pattern", () => {
    const result = stringToKeywordOptions.parse("(?i)keyword");
    expect(result).toStrictEqual({
      pattern: "keyword",
      casse: true,
      precision: 100,
      globalExclusion: false,
      localExclusion: false,
    });
  });

  test("should parse precision pattern", () => {
    const result = stringToKeywordOptions.parse("(?#75)keyword");
    expect(result).toStrictEqual({
      pattern: "keyword",
      casse: false,
      precision: 75,
      globalExclusion: false,
      localExclusion: false,
    });
  });

  test("should parse global exclusion pattern", () => {
    const result = stringToKeywordOptions.parse("!!keyword");
    expect(result).toStrictEqual({
      pattern: "keyword",
      casse: false,
      precision: 100,
      globalExclusion: true,
      localExclusion: false,
    });
  });

  test("should parse local exclusion pattern", () => {
    const result = stringToKeywordOptions.parse("(!!)keyword");
    expect(result).toStrictEqual({
      pattern: "keyword",
      casse: false,
      precision: 100,
      globalExclusion: false,
      localExclusion: true,
    });
  });

  test("should parse complex patterns", () => {
    const result = stringToKeywordOptions.parse("(!!)(?#90)(?i)keyword");
    expect(result).toStrictEqual({
      localExclusion: true,
      precision: 90,
      casse: true,
      pattern: "keyword",
      globalExclusion: false,
    });
  });
});

describe("stringToReaderOptions", () => {
  test("should parse FontHeight", () => {
    const result = stringToReaderOptions.parse("[FontHeight=12]");
    expect(result).toStrictEqual({
      fontHeight: 12,
      y: "max",
    });
  });

  test("should parse y with max value", () => {
    const result = stringToReaderOptions.parse("[y=max]");
    expect(result).toStrictEqual({
      fontHeight: 10,
      y: "max",
    });
  });

  test("should parse y with numeric value", () => {
    const result = stringToReaderOptions.parse("[y=600]");
    expect(result).toStrictEqual({
      fontHeight: 10,
      y: 600,
    });
  });

  test("should parse character exclusion", () => {
    const result = stringToReaderOptions.parse("[exclude={abc}]");
    expect(result).toStrictEqual({
      fontHeight: 10,
      y: "max",
      charExclusion: "abc",
    });
  });

  test("should parse complete reader options", () => {
    const result = stringToReaderOptions.parse("[FontHeight=12,y=600,exclude={abc}]");
    expect(result).toStrictEqual({
      fontHeight: 12,
      y: 600,
      charExclusion: "abc",
    });
  });
});

describe("stringToKeyword", () => {
  test("should detect and parse reader options", () => {
    const result = stringToKeyword.parse("[FontHeight=12,y=max]");
    expect(result).toStrictEqual({
      fontHeight: 12,
      y: "max",
    });
  });

  test("should detect and parse keyword options", () => {
    const result = stringToKeyword.parse("(!!)(?#90)(?i)keyword");
    expect(result).toStrictEqual({
      localExclusion: true,
      precision: 90,
      casse: true,
      pattern: "keyword",
      globalExclusion: false,
    });
  });

  test("should handle complex reader options", () => {
    const result = stringToKeyword.parse("[FontHeight=12,y=600,exclude={abc}]");
    expect(result).toStrictEqual({
      fontHeight: 12,
      y: 600,
      charExclusion: "abc",
    });
  });
});

describe("parseOptionsToString", () => {
  describe("reader options", () => {
    test("should generate default reader options", () => {
      const result = parseOptionsToString.parse({});
      expect(result).toBe("[FontHeight=10,y=max]");
    });

    test("should generate reader options with y max", () => {
      const result = parseOptionsToString.parse({ y: "max" });
      expect(result).toBe("[FontHeight=10,y=max]");
    });

    test("should generate reader options with numeric values", () => {
      const result = parseOptionsToString.parse({ y: 600, fontHeight: 12 });
      expect(result).toBe("[FontHeight=12,y=600]");
    });

    test("should include character exclusion", () => {
      const result = parseOptionsToString.parse({ 
        y: 600, 
        fontHeight: 12, 
        charExclusion: "abc" 
      });
      expect(result).toBe("[FontHeight=12,y=600,exclude={abc}]");
    });

    test("should reject invalid types", () => {
      expect(() => parseOptionsToString.parse({ y: "600", fontHeight: "12" })).toThrow();
    });
  });

  describe("keyword options", () => {
    test("should generate simple pattern", () => {
      const result = parseOptionsToString.parse({ pattern: "keyword" });
      expect(result).toBe("keyword");
    });

    test("should generate pattern with precision", () => {
      const result = parseOptionsToString.parse({ 
        pattern: "keyword", 
        precision: 75 
      });
      expect(result).toBe("(?#75)keyword");
    });

    test("should generate pattern with case insensitive", () => {
      const result = parseOptionsToString.parse({ 
        pattern: "keyword", 
        casse: true 
      });
      expect(result).toBe("(?i)keyword");
    });

    test("should generate pattern with exclusions neglicting errors", () => {
      const result = parseOptionsToString.parse({ 
        pattern: "keyword", 
        globalExclusion: true,
        localExclusion: true,
        precision: 100
      });
      expect(result).toBe("!!keyword");
    });

    test("should generate complex pattern", () => {
      const result = parseOptionsToString.parse({ 
        pattern: "keyword", 
        precision: 75,
        casse: true,
        globalExclusion: true,
        localExclusion: true
      });
      expect(result).toBe("!!(?i)keyword");
    });

    test("should ignore default precision value", () => {
      const result = parseOptionsToString.parse({ 
        pattern: "keyword", 
        precision: 100 
      });
      expect(result).toBe("keyword");
    });
  });
});
