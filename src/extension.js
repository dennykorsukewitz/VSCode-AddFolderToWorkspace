// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // console.log('Congratulations, your extension "AddFolderToWorkspace" is now active!');

    // This function add the selected folder to workspace (VSC Workspace).
    initAddFolderToWorkspace(context);
}

function initAddFolderToWorkspace(context) {

    const addFolderToWorkspaceId = 'addFolderToWorkspace';
    context.subscriptions.push(vscode.commands.registerCommand(addFolderToWorkspaceId, () => {

        let workspaceDirectories = [];
        let config = vscode.workspace.getConfiguration('addFolderToWorkspace');

        // Check if workspaces are defined.
        if (!config.workspaces.length) {
            vscode.commands.executeCommand('workbench.action.openSettings', 'addFolderToWorkspace');
            vscode.window.showWarningMessage(`AddFolderToWorkspace: Workspaces - Undefined`, { detail: 'Define at least one workspace (fullpath).\n\nExample: "/Users/workspace/"', modal: true });
            return;
        }

        // Get all first level directories.
        config.workspaces.forEach(myWorkspace => {
            let workspaceDirectory = fs.readdirSync(myWorkspace, { withFileTypes: true })
                .filter(dir => dir.isDirectory())
                .map(dir => myWorkspace + dir.name);

            workspaceDirectories = workspaceDirectories.concat(workspaceDirectory);
        })

        // Check if directories are defined.
        if (!workspaceDirectories.length) {
            vscode.commands.executeCommand('workbench.action.openSettings', 'addFolderToWorkspace');
            vscode.window.showWarningMessage(`AddFolderToWorkspace: Workspaces - Undefined`, { detail: 'Define at least one workspace (fullpath).\n\nExample: "/Users/workspace/"', modal: true });
            return;
        }

        // Open QuickPick and add selected Folder (Directory to VSC Workspace).
        vscode.window.showQuickPick(workspaceDirectories, {
            placeHolder: 'AddFolderToWorkspace: Add Folder to Workspace.',
        }).then((Selected) => {
            if (!Selected) return;

            // Get URI of selected directory.
            let URI = vscode.Uri.file(Selected);
            if (!URI) return;

            // Add selected Folder to Workspace.
            vscode.workspace.updateWorkspaceFolders(vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length : 0, null, { uri: URI });
        });
    }))
}

// This method is called when your extension is deactivated.
function deactivate() { }

module.exports = {
    activate,
    deactivate
}
