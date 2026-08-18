import { getTokenMetadata } from "../src/components/shared/SearchBar/Utils";
import {
  SearchBarTokenNature,
  CategoryType,
  SearchBarSuggestions,
  SearchBarToken,
} from "../src/types";

const emptySuggestions: SearchBarSuggestions = {
  items: [],
  nature: [],
  type: [],
};

const categorySuggestions: SearchBarSuggestions = {
  items: ["ID", "Status", "Site"],
  nature: Array(3).fill(SearchBarTokenNature.CATEGORY),
  type: [CategoryType.NUMBER, CategoryType.STRING, CategoryType.STRING],
};

const numberOperatorSuggestions: SearchBarSuggestions = {
  items: ["=", "!=", ">", "<"],
  nature: Array(4).fill(SearchBarTokenNature.OPERATOR),
  type: Array(4).fill(CategoryType.NUMBER),
};

// Loaded value-slot suggestions (e.g. the JobIDs of the jobs currently shown).
// These carry the VALUE nature and do NOT contain "1".
const numberValueSuggestions: SearchBarSuggestions = {
  items: ["55", "54", "31"],
  nature: Array(3).fill(SearchBarTokenNature.VALUE),
  type: Array(3).fill(CategoryType.NUMBER),
};

const categoryToken: SearchBarToken = {
  label: "ID",
  nature: SearchBarTokenNature.CATEGORY,
  type: CategoryType.NUMBER,
};

describe("getTokenMetadata", () => {
  it("classifies an operator from loaded operator suggestions", () => {
    expect(
      getTokenMetadata("=", numberOperatorSuggestions, categoryToken),
    ).toEqual({
      nature: SearchBarTokenNature.OPERATOR,
      type: CategoryType.NUMBER,
    });
  });

  it("classifies an operator after a category even when suggestions are stale", () => {
    // Regression: suggestions are updated by a debounced async effect. When
    // the user types "={enter}" fast, `suggestions` still holds the previous
    // (category) list. The operator must be classified from the static
    // Operators vocabulary, not dropped as CUSTOM.
    expect(getTokenMetadata("=", categorySuggestions, categoryToken)).toEqual({
      nature: SearchBarTokenNature.OPERATOR,
      type: CategoryType.NUMBER,
    });
  });

  it("classifies an operator after a category even when suggestions are empty", () => {
    expect(getTokenMetadata("=", emptySuggestions, categoryToken)).toEqual({
      nature: SearchBarTokenNature.OPERATOR,
      type: CategoryType.NUMBER,
    });
  });

  it("rejects an operator that is invalid for the category type", () => {
    // "in the last" is a date-only operator; after a NUMBER category it must
    // not classify as OPERATOR.
    const result = getTokenMetadata(
      "in the last",
      numberOperatorSuggestions,
      categoryToken,
    );
    expect(result.nature).not.toBe(SearchBarTokenNature.OPERATOR);
  });

  it("classifies a value typed while operator suggestions are still loaded", () => {
    const operatorToken: SearchBarToken = {
      label: "=",
      nature: SearchBarTokenNature.OPERATOR,
      type: CategoryType.NUMBER,
    };
    // Regression: typing "1{enter}" right after "={enter}" reaches
    // getTokenMetadata while `suggestions` still holds the operator list.
    // A stale operator list must not reject the value as CUSTOM.
    expect(
      getTokenMetadata("1", numberOperatorSuggestions, operatorToken),
    ).toEqual({
      nature: SearchBarTokenNature.VALUE,
      type: CategoryType.NUMBER,
    });
  });

  it("classifies a free value after an operator even when value suggestions are loaded and do not contain it", () => {
    const operatorToken: SearchBarToken = {
      label: "=",
      nature: SearchBarTokenNature.OPERATOR,
      type: CategoryType.NUMBER,
    };
    // Regression (CI e2e "should handle filter addition"): once the debounced
    // value-slot suggestions have loaded, they carry the VALUE nature and a
    // concrete list (existing JobIDs). Typing "1" — a valid value that no
    // current job happens to have — must still classify as VALUE, not CUSTOM.
    // Otherwise a filter-only search bar drops the value token and "ID = 1"
    // yields only two chips instead of three.
    expect(
      getTokenMetadata("1", numberValueSuggestions, operatorToken),
    ).toEqual({
      nature: SearchBarTokenNature.VALUE,
      type: CategoryType.NUMBER,
    });
  });
});
