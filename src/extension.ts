import * as vscode from "vscode";
import { createAAAComment } from "./aaa-comment-maker";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "aaa-comment-maker.createAAAComment",
    createAAAComment
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
