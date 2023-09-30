# Changelog

All notable changes to the "AddFolderToWorkspace" extension will be documented in this file.

## [1.1.2]

### Maintenance

- Added additional check if vscode.workspace.workspaceFolders exists.
- Saves the new manually entered directory globally.

## [1.1.1]

`AddFolderToWorkspace: Add manually a directory...` - Paths can be added manually from now on. After that, the new workspace can be saved directly in the settings.

Fixed bug - when a workspace has already been added.

## [1.1.0]

### AddFolderToWorkspace

This Function provides a searchable list of folders (Workspaces) that can be added **simultaneous** to the current VSC Workspace. All configured folders will be displayed.

**Shortcut:** ```strg + alt + k, p```<br>
**Command:**  ```AddFolderToWorkspace: Add Folder to Workspace.```

### RemoveFolderFromWorkspace

This Function provides a searchable list of folders (Workspaces) that can be removed **simultaneous** from the current VSC Workspace. All current open folders are displayed.

**Shortcut:** ```strg + alt + k, shift + p```<br>
**Command:**  ```AddFolderToWorkspace: Remove Folder from Workspace.```

## [1.0.2]

### Maintenance

- Updated README.md
- Updated categories and keywords for Visual Studio Marketplace.

## [1.0.1]

### Maintenance

- Updated README.md
- Changed Shortcut to ```strg + alt + k, p```
- Added Screenshots

## [1.0.0]

### Initial release of AddFolderToWorkspace extension

**AddFolderToWorkspace** is an extension that adds the selected folder to the workspace (VSC Workspace).
Of course, you can use the already built-in function (`workbench.action.addRootFolder`). But then you have to click through all the folders again and again.
