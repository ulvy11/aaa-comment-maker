import * as vscode from "vscode";
import {
  CharacterPair,
  Position,
  Range,
  QuickPickItem,
  QuickPickItemKind,
} from "vscode";
import { getCommentTokens } from "./language-config-finder";
import {
  getCommentMinNbSymbol,
  getNoCommentNbSymbol,
  getSymbol,
  getTitles,
  NO_TITLE,
  CREATE_ONE,
} from "./config";

const SPACE = " ";

class AAACommentParametersMaker {
  private _titles: string[];
  private _symbol: string;
  private _commentTokens: CharacterPair;
  private _noCommentNbSymbol: number;
  private _commentMinNbSymbol: number;

  constructor(commentTokens: CharacterPair) {
    this._titles = getTitles();
    this._symbol = getSymbol();
    this._noCommentNbSymbol = getNoCommentNbSymbol();
    this._commentMinNbSymbol = getCommentMinNbSymbol();
    this._commentTokens = commentTokens;
  }

  public get titles(): string[] {
    return this._titles;
  }

  public get symbol(): string {
    return this._symbol;
  }

  public createMultiLineComment(
    lines: string[],
    tab: string,
    picked: string
  ): string[] {
    let commentedLines: string[] = [];
    let flatLine: string;

    if (lines.length == 1 && lines[0] === "") {
      flatLine = this.createOneLineComment(
        "",
        tab,
        this._noCommentNbSymbol * 2 + picked.length + 2
      );
      if (picked !== NO_TITLE) {
        commentedLines.push(
          this.createOneLineComment(picked, tab, this._noCommentNbSymbol)
        );
      }
    } else {
      const maxLength = Math.max(
        lines.reduce((prev, curr) => Math.max(prev, curr.length), 0),
        picked.length
      );

      flatLine = this.createOneLineComment(
        "",
        tab,
        this._commentMinNbSymbol * 2 + maxLength + 2
      );

      let linesToComment = [...lines];

      if (picked !== NO_TITLE) {
        linesToComment.unshift(picked);
      }

      linesToComment.forEach((line) => {
        if (line === "") {
          commentedLines.push(flatLine);
        } else {
          commentedLines.push(
            this.createOneLineComment(
              line,
              tab,
              this._commentMinNbSymbol + ~~((maxLength - line.length) / 2)
            )
          );
        }
      });
    }

    commentedLines.unshift(flatLine);
    commentedLines.push(flatLine);

    return commentedLines;
  }

  /**
   *
   * @param text
   * @param tab nb of white spaces before comment
   * @param nbSymbol if text is empty, the total number of symbol to display, else the number of symbol to display on each side of text (i.e. half)
   * @param commentTokens
   * @returns
   */
  public createOneLineComment(
    text: string,
    tab: string,
    nbSymbol: number
  ): string {
    let middle: string;

    if (text === "") {
      middle = this._symbol.repeat(nbSymbol);
    } else {
      middle =
        this._symbol.repeat(nbSymbol) +
        SPACE +
        text +
        SPACE +
        this._symbol.repeat(nbSymbol);
    }

    return (
      tab +
      this._commentTokens[0] +
      SPACE +
      middle +
      SPACE +
      this._commentTokens[1]
    );
  }
}

export async function createAAAComment() {
  const comments = getCommentTokens();
  if (!comments) return;

  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const selection = editor.selection;

  let aaaCommentParametersMaker = new AAACommentParametersMaker(comments);

  let picked = (
    await vscode.window.showQuickPick<QuickPickItem>(
      [
        { label: NO_TITLE },
        { label: "", kind: QuickPickItemKind.Separator },
        ...aaaCommentParametersMaker.titles.map((e) => {
          return {
            label: e,
          };
        }),
        { label: "", kind: QuickPickItemKind.Separator },
        { label: CREATE_ONE },
      ],
      {
        placeHolder: "Select a title for the comment",
      }
    )
  )?.label;
  if (!picked) return;

  if (picked === CREATE_ONE) {
    picked = await vscode.window.showInputBox({
      title: "Create your own comment title",
      placeHolder: aaaCommentParametersMaker.titles[0],
    });

    if (!picked) return;
  }

  const lastLineText = editor.document.lineAt(selection.end);

  // Do as all lines were selected
  const textRange = new Range(
    new Position(selection.start.line, 0),
    new Position(selection.end.line, lastLineText.text.length)
  );

  const text = editor.document.getText(textRange);

  const firstTextLine = text.split("\n")[0];
  const tab = firstTextLine.substring(
    0,
    firstTextLine.length - firstTextLine.trim().length
  );

  const lines = text.split("\n").map((s) => s.trim());

  const commentedLines = aaaCommentParametersMaker.createMultiLineComment(
    lines,
    tab,
    picked
  );

  editor.edit((editBuilder) => {
    editBuilder.replace(textRange, commentedLines.join("\n"));
  });
}
