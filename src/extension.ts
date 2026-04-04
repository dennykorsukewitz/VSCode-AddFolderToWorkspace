import * as vscode from 'vscode';

/**
 * @param {vscode.ExtensionContext} context
 */
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // console.log('Congratulations, your extension "AddFolderToWorkspace" is now active!');

    // This function add the selected folder to workspace (VSC Workspace).
    initAddFolderToWorkspace(context);

    // This function removes the selected folder from workspace (VSC Workspace).
    initRemoveFolderFromWorkspace(context);
}

function initAddFolderToWorkspace(context: vscode.ExtensionContext) {

    const addFolderToWorkspaceId = 'addFolderToWorkspace';
    context.subscriptions.push(vscode.commands.registerCommand(addFolderToWorkspaceId, async () => {

        let workspaceDirectories: string[] = [],
            newWorkspaceFound = false,
            manualWorkspace: string | undefined = '';
        const manualDirectoryString = '-- Add manually a directory --';

        const config = vscode.workspace.getConfiguration('addFolderToWorkspace');

        // Check if workspaces are defined.
        if (!config.workspaces.length && !config.recursiveWorkspaces.length) {
            vscode.commands.executeCommand('workbench.action.openSettings', 'addFolderToWorkspace');
            vscode.window.showWarningMessage(`AddFolderToWorkspace: Workspaces - Undefined`, { detail: 'Define at least one workspace (fullpath).\n\nExample: "/Users/workspace/"', modal: true });
            return;
        }

        // Get all stored directories and recursive directories.
        workspaceDirectories = await getWorkspaceDirectories();

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
        const workspaces = await vscode.window.showQuickPick(workspaceDirectories, {
            title: 'AddFolderToWorkspace',
            placeHolder: 'AddFolderToWorkspace: Select a folder...',
            canPickMany: true,
        });
        if (!workspaces) {return;}

        if (workspaces.length && workspaces.includes(manualDirectoryString)) {

            workspaces.shift();
            newWorkspaceFound = true;

            manualWorkspace = await vscode.window.showInputBox({
                title: 'AddFolderToWorkspace',
                placeHolder: 'AddFolderToWorkspace: Add manually a directory...',
            });

            if (manualWorkspace) {
                workspaces.push(manualWorkspace);
            }
        }
        if (!workspaces) {return;}

        const workspaceURIs: { uri: vscode.Uri }[] = [];
        for await (const workspace of workspaces) {

            // Get URI of selected directory.
            const folderUri = vscode.Uri.file(workspace);
            let URIexists = 0;

            if (vscode.workspace.workspaceFolders) {
                Array.from(vscode.workspace.workspaceFolders).sort().forEach(function (workspaceFolder: vscode.WorkspaceFolder) {

                    if (folderUri.path === workspaceFolder.uri.path) {
                        URIexists = 1;
                    }
                });
            }

            if (!URIexists) {
                workspaceURIs.push({ uri: folderUri });
            }
        }

        if (!workspaceURIs.length) {return;}

        if (newWorkspaceFound) {
            const addNewWorkspaceToConfig = await vscode.window.showQuickPick(['yes', 'no'], {
                title: 'AddFolderToWorkspace (New Workspace)',
                placeHolder: 'AddFolderToWorkspace: Should I save the new workspace in the settings?',
                canPickMany: false,
            });

            if (addNewWorkspaceToConfig === 'yes') {

                if (manualWorkspace && !manualWorkspace.endsWith("/")) {
                    manualWorkspace += '/';
                }
                const configWorkspaces = config.workspaces;
                configWorkspaces.push(manualWorkspace);

                await vscode.workspace.getConfiguration().update('addFolderToWorkspace.workspaces', configWorkspaces, true);
            }
        }

        // If position is 'Top', the new folder will be added at the beginning of the current workspace.
        // If position is 'Bottom', the new folder will be added at the end of the current workspace.
        let position = 0;
        if (config.position === 'Bottom'){
            position = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length : 0;
        }

        // Add selected Folder to Workspace.
        await updateWorkspaceAndWait(position, 0, workspaceURIs);

    }));
}

function initRemoveFolderFromWorkspace(context: vscode.ExtensionContext) {

    const removeFolderFromWorkspaceId = 'removeFolderFromWorkspace';
    context.subscriptions.push(vscode.commands.registerCommand(removeFolderFromWorkspaceId, async () => {

        // Check all current workspace folders.
        const workspaceFolders: string[] = [];

        let existingWorkspaceFolders = vscode.workspace.workspaceFolders;
        if (!existingWorkspaceFolders) { return; }

        Array.from(existingWorkspaceFolders).sort().forEach(function (workspaceFolder: vscode.WorkspaceFolder) {
            workspaceFolders.push(workspaceFolder.name);
        });

        if (!workspaceFolders.length) {return;}

        // Create showQuickPick 'RemoveFolderFromWorkspace' selection.
        const workspaces = await vscode.window.showQuickPick(workspaceFolders, {
            title: 'RemoveFolderFromWorkspace',
            placeHolder: 'RemoveFolderFromWorkspace: Select workspaces to be removed...',
            canPickMany: true,
        });

        if (!workspaces) {return;}

        const removeIndexes: number[] = [];

        // Sort and reverse selected 'remove' Folder from Workspace.
        existingWorkspaceFolders = vscode.workspace.workspaceFolders;
        if (!existingWorkspaceFolders) { return; }

        Array.from(existingWorkspaceFolders).sort().forEach(function (workspaceFolder: vscode.WorkspaceFolder) {
            // workspaceFolders.push(workspaceFolder.name)
            const removeWorkspace = workspaces?.includes(workspaceFolder.name);

            if (removeWorkspace) {
                removeIndexes.push(workspaceFolder.index);
            }
        });

        // Remove selected Folder from Workspace.
        for await (const removeIndex of removeIndexes.reverse()) {
            await updateWorkspaceAndWait(removeIndex, 1, []);
        }
    }));
}

function updateWorkspaceAndWait(start: number, deleteCount: number, workspaceFoldersToAdd: { uri: vscode.Uri; name?: string }[]) {
    const disposable: vscode.Disposable[] = [];

    // Register the listener before updateWorkspaceFolders so we do not miss a synchronously emitted event.
    return new Promise<void>((resolve, reject) => {
        vscode.workspace.onDidChangeWorkspaceFolders(() => {
            resolve();
        }, null, disposable);

        // Note: it is not valid to call updateWorkspaceFolders() multiple times
        // without waiting for the onDidChangeWorkspaceFolders() to fire.
        // So we have to always wait in case we want to add or remove multiple folders.
        const success = vscode.workspace.updateWorkspaceFolders(start, deleteCount, ...workspaceFoldersToAdd);
        if (!success) {
            reject(new Error("Failed to update workspace"));
        }
    }).finally(() => disposable.forEach((disp) => disp.dispose()));
}

async function getWorkspaceDirectories() {

    const config = vscode.workspace.getConfiguration('addFolderToWorkspace');

    let workspaceDirectories = config.workspaces || [];

    // Get all first level directories from given directories.
    const workspaceDirectoriesPromises = config.recursiveWorkspaces.map(async (myWorkspace: string) => {
        const subDirs: string[] = [];
        const workspaceDir = await vscode.workspace.fs.readDirectory(vscode.Uri.file(myWorkspace));

        workspaceDir.forEach((dir) => {
            if (dir[1] === vscode.FileType.Directory) {
                subDirs.push(vscode.Uri.joinPath(vscode.Uri.file(myWorkspace), dir[0]).fsPath);
            }
        });
        return subDirs;
    });

    const recursiveWorkspaceDirectories = (await Promise.all(workspaceDirectoriesPromises)).flat();
    workspaceDirectories = workspaceDirectories.concat(recursiveWorkspaceDirectories);

    return workspaceDirectories;
}

// This method is called when your extension is deactivated.
export function deactivate() { }