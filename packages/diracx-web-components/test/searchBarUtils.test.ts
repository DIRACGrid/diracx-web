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
});
