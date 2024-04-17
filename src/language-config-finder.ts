import {
  LanguageConfiguration,
  extensions,
  window,
  CharacterPair,
} from "vscode";
import { parse, assign } from "comment-json";
import * as fs from "fs";
import * as path from "path";

export function getLanguageConfiguration(
  languageId: string
): LanguageConfiguration | null {
  var langConfigFilepath: string = "";
  for (const _ext of extensions.all) {
    // All vscode default extensions ids starts with "vscode."
    if (
      _ext.id.startsWith("vscode.") &&
      _ext.packageJSON.contributes &&
      _ext.packageJSON.contributes.languages
    ) {
      // Find language data from "packageJSON.contributes.languages" for the languageId
      const packageLangData = _ext.packageJSON.contributes.languages.find(
        (_packageLangData: any) => _packageLangData.id === languageId
      );
      // If found, get the absolute config file path
      if (!!packageLangData) {
        langConfigFilepath = path.join(
          _ext.extensionPath,
          packageLangData.configuration
        );
        break;
      }
    }
  }
  let langConfig: LanguageConfiguration | null = null;
  // Validate config file existance
  if (langConfigFilepath != "" && fs.existsSync(langConfigFilepath)) {
    // Use comment-json in case some json has comments
    langConfig = assign(
      {},
      parse(fs.readFileSync(langConfigFilepath).toString(), undefined, true)
    );
  } else {
    window.showErrorMessage(
      `Cannot find Language Configuration for language ${languageId}`
    );
  }

  return langConfig;
}

export function getActiveTextEditorLanguageConfiguration(): LanguageConfiguration | null {
  let languageId = window.activeTextEditor?.document.languageId ?? "";

  if (!!languageId) {
    return getLanguageConfiguration(languageId);
  }

  window.showErrorMessage("No current file open");

  return null;
}

export function getCommentTokens(): CharacterPair | null {
  const languageConfiguration = getActiveTextEditorLanguageConfiguration();
  if (!languageConfiguration) return null;

  const comments = languageConfiguration.comments;
  if (!comments) {
    showErrorNoCommentFound();
    return null;
  }

  if (comments.blockComment) return comments.blockComment;

  if (comments.lineComment) return [comments.lineComment, ""];

  showErrorNoCommentFound();
  return null;
}

function showErrorNoCommentFound() {
  const languageId =
    window.activeTextEditor?.document.languageId ?? "no language found";

  window.showErrorMessage(
    `No comments tokens were found for language "${languageId}"`
  );
}
