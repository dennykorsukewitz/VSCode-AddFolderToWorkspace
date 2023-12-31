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

    // This function removes the selected folder from workspace (VSC Workspace).
    initRemoveFolderFromWorkspace(context);
}

function initAddFolderToWorkspace(context) {

    const addFolderToWorkspaceId = 'addFolderToWorkspace';
    context.subscriptions.push(vscode.commands.registerCommand(addFolderToWorkspaceId, async () => {

        let workspaceDirectories = [],
            newWorkspaceFound = 0,
            manualWorkspace = '',
            manualDirectoryString = '-- Add manually a directory --';

        let config = vscode.workspace.getConfiguration('addFolderToWorkspace');

        // Check if workspaces are defined.
        if (!config.workspaces.length && !config.recursiveWorkspaces.length) {
            vscode.commands.executeCommand('workbench.action.openSettings', 'addFolderToWorkspace');
            vscode.window.showWarningMessage(`AddFolderToWorkspace: Workspaces - Undefined`, { detail: 'Define at least one workspace (fullpath).\n\nExample: "/Users/workspace/"', modal: true });
            return;
        }

        // Add all stored workspaces / directories.
        workspaceDirectories = config.workspaces || [];

        // Get all first level directories from given directories.
        config.recursiveWorkspaces.forEach(myWorkspace => {
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

        if (workspaceDirectories.length && !workspaceDirectories.includes(manualDirectoryString)) {
            workspaceDirectories.unshift(manualDirectoryString);
        }

        // Open QuickPick and add selected Folder (Directory to VSC Workspace).
        let workspaces = await vscode.window.showQuickPick(workspaceDirectories, {
            title: 'AddFolderToWorkspace',
            placeHolder: 'AddFolderToWorkspace: Select a folder...',
            canPickMany: true,
        })
        if (!workspaces) return;

        if (workspaces.length && workspaces.includes(manualDirectoryString)) {

            workspaces.shift(manualDirectoryString);
            newWorkspaceFound = 1;

            manualWorkspace = await vscode.window.showInputBox({
                title: 'AddFolderToWorkspace',
                placeHolder: 'AddFolderToWorkspace: Add manually a directory...',
            });

            if (manualWorkspace) {
                workspaces.push(manualWorkspace);
            }
        }
        if (!workspaces) return;

        let workspaceURIs = [];
        for await (const workspace of workspaces) {

            // Get URI of selected directory.
            let URI = vscode.Uri.file(workspace),
                URIexists = 0;

            if (!URI) return;

            if (vscode.workspace.workspaceFolders) {
                vscode.workspace.workspaceFolders.sort().forEach(function (workspaceFolder) {

                    if (URI.path == workspaceFolder.uri.path) {
                        URIexists = 1;
                    }
                })
            }

            if (!URIexists) {
                workspaceURIs.push({ uri: URI });
            }
        }

        if (!workspaceURIs.length) return;

        if (newWorkspaceFound) {
            let addNewWorkspaceToConfig = await vscode.window.showQuickPick(['yes', 'no'], {
                title: 'AddFolderToWorkspace (New Workspace)',
                placeHolder: 'AddFolderToWorkspace: Should I save the new workspace in the settings?',
                canPickMany: false,
            });

            if (addNewWorkspaceToConfig == 'yes') {

                if (!manualWorkspace.endsWith("/")) {
                    manualWorkspace += '/';
                }
                let configWorkspaces = config.workspaces;
                configWorkspaces.push(manualWorkspace);

                await vscode.workspace.getConfiguration().update('addFolderToWorkspace.workspaces', configWorkspaces, true);
            }
        }

        // Add selected Folder to Workspace.
        await updateWorkspaceAndWait(0, null, workspaceURIs);

    }))
}

function initRemoveFolderFromWorkspace(context) {

    const removeFolderFromWorkspaceId = 'removeFolderFromWorkspace';
    context.subscriptions.push(vscode.commands.registerCommand(removeFolderFromWorkspaceId, async () => {

        // Check all current workspace folders.
        let workspaceFolders = [];
        vscode.workspace.workspaceFolders.sort().forEach(function (workspaceFolder) {
            workspaceFolders.push(workspaceFolder.name)
        })

        if (!workspaceFolders.length) return;

        // Create showQuickPick 'RemoveFolderFromWorkspace' selection.
        let workspaces = await vscode.window.showQuickPick(workspaceFolders, {
            title: 'RemoveFolderFromWorkspace',
            placeHolder: 'RemoveFolderFromWorkspace: Select workspaces to be removed...',
            canPickMany: true,
        });

        if (!workspaces) return;

        let removeIndexes = [];

        // Sort and reverse selected 'remove' Folder from Workspace.
        vscode.workspace.workspaceFolders.sort().forEach(function (workspaceFolder) {
            // workspaceFolders.push(workspaceFolder.name)
            let removeWorkspace = workspaces.includes(workspaceFolder.name);

            if (removeWorkspace) {
                removeIndexes.push(workspaceFolder.index)
            }
        })

        // Remove selected Folder from Workspace.
        for await (const removeIndex of removeIndexes.reverse()) {
            await updateWorkspaceAndWait(removeIndex, 1, []);
        }
    }))
}

function updateWorkspaceAndWait(start, deleteCount, workspaceFoldersToAdd) {
    const success = vscode.workspace.updateWorkspaceFolders(start, deleteCount, ...workspaceFoldersToAdd)

    if (success) {
        const disps = []
        return new Promise(resolve => {

            // Note: it is not valid to call updateWorkspaceFolders() multiple times
            // without waiting for the onDidChangeWorkspaceFolders() to fire.
            // So we have to always wait in case we want to add or remove multiple folders.
            vscode.workspace.onDidChangeWorkspaceFolders(() => {
                resolve();
            }, null, disps);

        }).finally(() => disps.forEach(disp => disp.dispose()));
    } else {
        return Promise.reject(new Error("Failed to update workspace"))
    }
}

// This method is called when your extension is deactivated.
function deactivate() { }

module.exports = {
    activate,
    deactivate
}
