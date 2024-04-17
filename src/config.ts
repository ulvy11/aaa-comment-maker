import * as vscode from "vscode";

const PROPERTY_SYMBOL = "symbol";
const PROPERTY_TITLES = "titles";
const PROPERTY_NO_COMMENT_NB_SYMBOL = "noCommentNbSymbol";
const PROPERTY_COMMENT_MIN_NB_SYMBOL = "commentMinNbSymbol";

/**
 * Arrange Act Assert string Array
 */
const AAA = ["Arrange", "Act", "Assert"];

export const CREATE_ONE = "Create your own title...";

export const NO_TITLE = "No title";

/**
 * Default symbol to display within the comment
 */
export const DEFAULT_SYMBOL = "=";

const NO_COMMENT_NB_SYMBOL = 8;

const COMMENT_MIN_NB_SYMBOL = 6;

export function getProperty<T>(name: string, def: T): T {
  let property: T =
    vscode.workspace.getConfiguration("aaaCommentMaker").get<T>(name) ?? def;

  try {
    let stringProperty = <string>property;
    if (stringProperty.trim() === "") property = def;
  } catch (error) {}

  return property;
}

export function getTitles(): string[] {
  return getProperty<string[]>(PROPERTY_TITLES, AAA);
}

export function getSymbol(): string {
  return getProperty<string>(PROPERTY_SYMBOL, DEFAULT_SYMBOL);
}

export function getNoCommentNbSymbol(): number {
  return getProperty<number>(
    PROPERTY_NO_COMMENT_NB_SYMBOL,
    NO_COMMENT_NB_SYMBOL
  );
}

export function getCommentMinNbSymbol(): number {
  return getProperty<number>(
    PROPERTY_COMMENT_MIN_NB_SYMBOL,
    COMMENT_MIN_NB_SYMBOL
  );
}
