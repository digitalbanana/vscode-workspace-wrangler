import * as vscode from "vscode";
import * as cp from "child_process";
import * as util from "util";

const exec = util.promisify(cp.exec);

async function closeAllFiles() {
  await vscode.commands.executeCommand("workbench.action.closeAllEditors");
}

async function collapseAllFiles() {
  // await vscode.commands.executeCommand(
  //   "workbench.files.action.collapseExplorerFolders"
  // );
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage("No workspace folders found");
    return;
  }

  for (const folder of workspaceFolders) {
    await vscode.commands.executeCommand(
      "workbench.files.action.collapseExplorerFolders",
      folder.uri
    );
  }
}

async function checkoutMainBranch() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage("No workspace folders found");
    return;
  }

  for (const folder of workspaceFolders) {
    try {
      await exec("git checkout main", { cwd: folder.uri.fsPath });
      vscode.window.showInformationMessage(
        `Checked out main branch in ${folder.name}`
      );
    } catch (error) {
      const errorMessage = (error as any).message || "Unknown error";
      vscode.window.showErrorMessage(
        `Failed to checkout main branch in ${folder.name}: ${errorMessage}`
      );
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.closeFilesAndCheckoutMain",
    async () => {
      await closeAllFiles();
      await collapseAllFiles();
      await checkoutMainBranch();
    }
  );

  context.subscriptions.push(disposable);
}
