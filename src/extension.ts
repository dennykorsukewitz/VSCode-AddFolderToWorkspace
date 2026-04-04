import * as vscode from 'vscode';

const RECENT_PATHS_STORAGE_KEY = 'addFolderToWorkspace.recentPaths';

/**
 * @param {vscode.ExtensionContext} context
 */
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // console.log('Congratulations, your extension "AddFolderToWorkspace" is now active!');

    // This function add the selected folder to workspace (VSC Workspace).
    initAddFolderToWorkspace(context);

    // Pick from globally stored recent folders only (no workspace config required).
    initAddRecentFoldersToWorkspace(context);

    // Clear global recent folder paths (globalState).
    initClearRecentFoldersPaths(context);

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
        const recentFoldersCount = config.get<number>('recentFoldersCount', 5);

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

        const storedRecent = context.globalState.get<string[]>(RECENT_PATHS_STORAGE_KEY) ?? [];
        workspaceDirectories = orderDirectoriesForQuickPick(
            workspaceDirectories,
            storedRecent,
            manualDirectoryString,
            recentFoldersCount,
        );

        // Open QuickPick and add selected Folder (Directory to VSC Workspace).
        const workspaces = await vscode.window.showQuickPick(workspaceDirectories, {
            title: 'AddFolderToWorkspace',
            placeHolder: 'AddFolderToWorkspace: Select a folder...',
            canPickMany: true,
        });
        if (!workspaces) {return;}

        if (workspaces.length && workspaces.includes(manualDirectoryString)) {

            newWorkspaceFound = true;
            const manualIndex = workspaces.indexOf(manualDirectoryString);
            if (manualIndex >= 0) {
                workspaces.splice(manualIndex, 1);
            }

            manualWorkspace = await vscode.window.showInputBox({
                title: 'AddFolderToWorkspace',
                placeHolder: 'AddFolderToWorkspace: Add manually a directory...',
            });

            if (manualWorkspace) {
                workspaces.push(manualWorkspace);
            }
        }
        if (!workspaces) {return;}

        const workspaceURIs = getWorkspaceFolderUrisToAdd(workspaces);

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
        await addWorkspaceFoldersAndPersistRecents(context, position, workspaceURIs, recentFoldersCount);

    }));
}

function initAddRecentFoldersToWorkspace(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('addRecentFoldersToWorkspace', async () => {
            const raw = context.globalState.get<string[]>(RECENT_PATHS_STORAGE_KEY) ?? [];
            const paths = dedupeRecentPathsPreserveOrder(raw);
            if (!paths.length) {
                vscode.window.showInformationMessage(
                    'AddFolderToWorkspace: No recent folders yet. Use "Add Folder to Workspace" first.',
                );
                return;
            }

            const selected = await vscode.window.showQuickPick(paths, {
                title: 'AddFolderToWorkspace - Recent folders',
                placeHolder: 'Select one or more recent folders to add...',
                canPickMany: true,
            });
            if (!selected?.length) {
                return;
            }

            const workspaceURIs = getWorkspaceFolderUrisToAdd(selected);
            if (!workspaceURIs.length) {
                vscode.window.showInformationMessage(
                    'AddFolderToWorkspace: Selected folders are already in this workspace.',
                );
                return;
            }

            const config = vscode.workspace.getConfiguration('addFolderToWorkspace');
            const recentFoldersCount = config.get<number>('recentFoldersCount', 5);
            let position = 0;
            if (config.position === 'Bottom') {
                position = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length : 0;
            }
            await addWorkspaceFoldersAndPersistRecents(context, position, workspaceURIs, recentFoldersCount);
        }),
    );
}

function initClearRecentFoldersPaths(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('clearRecentFoldersToWorkspace', async () => {
            const existing = context.globalState.get<string[]>(RECENT_PATHS_STORAGE_KEY) ?? [];
            if (!existing.length) {
                vscode.window.showInformationMessage(
                    'AddFolderToWorkspace: Recent folders list is already empty.',
                );
                return;
            }
            await context.globalState.update(RECENT_PATHS_STORAGE_KEY, undefined);
            vscode.window.showInformationMessage('AddFolderToWorkspace: Recent folders list cleared.');
        }),
    );
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

/**
 * Single add-folder update: persist recent paths as soon as updateWorkspaceFolders accepts the change,
 * then wait for the workspace folder event (required before any further updateWorkspaceFolders call).
 */
async function addWorkspaceFoldersAndPersistRecents(
    context: vscode.ExtensionContext,
    position: number,
    workspaceURIs: { uri: vscode.Uri }[],
    recentFoldersCount: number,
): Promise<void> {
    const disposable: vscode.Disposable[] = [];
    let updateAccepted = false;
    const workspaceChange = new Promise<void>((resolve, reject) => {
        vscode.workspace.onDidChangeWorkspaceFolders(() => {
            resolve();
        }, null, disposable);

        updateAccepted = vscode.workspace.updateWorkspaceFolders(position, 0, ...workspaceURIs);
        if (!updateAccepted) {
            reject(new Error('Failed to update workspace'));
        }
    });

    try {
        if (updateAccepted) {
            await recordRecentAddedFolders(
                context,
                RECENT_PATHS_STORAGE_KEY,
                workspaceURIs.map((entry) => entry.uri),
                recentFoldersCount,
            );
        }
        await workspaceChange;
    } finally {
        disposable.forEach((d) => d.dispose());
    }
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

function dedupeRecentPathsPreserveOrder(paths: string[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const p of paths) {
        const normalized = vscode.Uri.file(p).fsPath;
        if (seen.has(normalized)) {
            continue;
        }
        seen.add(normalized);
        out.push(normalized);
    }
    return out;
}

function getWorkspaceFolderUrisToAdd(selectedPaths: string[]): { uri: vscode.Uri }[] {
    const workspaceURIs: { uri: vscode.Uri }[] = [];
    for (const workspace of selectedPaths) {
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
    return workspaceURIs;
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

function orderDirectoriesForQuickPick(
    baseDirectories: string[],
    storedRecentPaths: string[],
    manualLabel: string,
    recentLimit: number,
): string[] {
    const recentSegment: string[] = [];
    if (recentLimit > 0 && storedRecentPaths.length) {
        const seen = new Set<string>();
        for (const p of storedRecentPaths) {
            const normalized = vscode.Uri.file(p).fsPath;
            if (seen.has(normalized)) {
                continue;
            }
            seen.add(normalized);
            recentSegment.push(normalized);
            if (recentSegment.length >= recentLimit) {
                break;
            }
        }
    }

    const recentSet = new Set(recentSegment.map((p) => vscode.Uri.file(p).fsPath));
    const rest = baseDirectories.filter((p) => !recentSet.has(vscode.Uri.file(p).fsPath));

    return [...recentSegment, manualLabel, ...rest];
}

async function recordRecentAddedFolders(
    context: vscode.ExtensionContext,
    storageKey: string,
    addedUris: vscode.Uri[],
    limit: number,
): Promise<void> {
    if (limit <= 0 || !addedUris.length) {
        return;
    }

    let next = context.globalState.get<string[]>(storageKey) ?? [];
    for (let i = addedUris.length - 1; i >= 0; i--) {
        const normalized = addedUris[i].fsPath;
        next = next.filter((p) => vscode.Uri.file(p).fsPath !== normalized);
        next.unshift(normalized);
    }

    next = next.slice(0, limit);
    await context.globalState.update(storageKey, next);
}

// This method is called when your extension is deactivated.
export function deactivate() { }