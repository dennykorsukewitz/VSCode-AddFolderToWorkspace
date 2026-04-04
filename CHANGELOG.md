# Changelog

All notable changes to this project will be documented in this file.

## [2.1.0] - 2026-04-04

### Added

- Command **Add Recent Folders to Workspace** (`addRecentFoldersToWorkspace`) to pick from the saved recent list only; default keybinding `Ctrl+Alt+K R` (`Cmd+Alt+K R` on macOS where applicable).
- Command **Clear Recent Folders List** (`clearRecentFoldersToWorkspace`) to remove all entries from the global recent list.
- Setting `addFolderToWorkspace.recentFoldersCount` (default `5`, minimum `0`) to control how many recently added folders are pinned at the top of the **Add Folder to Workspace** quick pick. When set to `0`, that pinned section is hidden and recent paths are not persisted.
- Global recent-folder history in extension `globalState` under `addFolderToWorkspace.recentPaths` (per user profile, not per workspace file).

### Changed

- **Add Folder to Workspace** quick pick order: recent entries (if any and limit > 0), the manual directory option, then configured and recursive workspace directories (duplicates with the recent section omitted).
- When the manual directory option is used together with other selections, it is removed by index instead of `Array.shift()`, so behavior stays correct when recent rows appear above the manual row.
- Adding folders (main command and **Add Recent Folders**) now persists the global recent list right after `updateWorkspaceFolders` accepts the update, then waits for the workspace-folder change event. That order avoids missing or delayed `onDidChangeWorkspaceFolders` so recent paths update reliably on the first run.

## [2.0.1] - 2024-04-25

### Changed

- Changed to reusable.release.vscode.yml.
- Keep a changelog.
- Updated icon.

## [2.0.0] - 2024-02-06

### Changed

- Changed source language to TypeScript.
- Added esbuild to get Browser Editor support.
- Refactored code.
- Added addFolderToWorkspace.position: If position is 'Top', the new folder will be added at the beginning of the current workspace. If position is 'Bottom', the new folder will be added at the end of the current workspace.

## [1.2.1] - 2023-11-14

### Changed

- Added additional check if vscode.workspace.workspaceFolders exists.
- Saves the new manually entered directory globally.
- Recursive Workspaces (only first level): Added new setting `addFolderToWorkspace.recursiveWorkspaces` to use recursive Workspaces (only first level).

## [1.1.1] - 2023-09-17

### Changed

- `AddFolderToWorkspace: Add manually a directory...` - Paths can be added manually from now on. After that, the new workspace can be saved directly in the settings.
- Fixed bug - when a workspace has already been added.

## [1.1.0] - 2023-08-28

### Added

- AddFolderToWorkspace: This Function provides a searchable list of folders (Workspaces) that can be added **simultaneous** to the current VSC Workspace. All configured folders will be displayed.
- RemoveFolderFromWorkspace: This Function provides a searchable list of folders (Workspaces) that can be removed **simultaneous** from the current VSC Workspace. All current open folders are displayed.

## [1.0.2] - 2023-08-08

### Changed

- Updated README.md
- Updated categories and keywords for Visual Studio Marketplace.

## [1.0.1] - 2023-07-13

### Changed

- Updated README.md
- Changed Shortcut to ```strg + alt + k, p```
- Added Screenshots

## [1.0.0] - 2023-07-04

### Added

- `AddFolderToWorkspace` is an extension that adds the selected folder to the workspace (VSC Workspace). Of course, you can use the already built-in function (`workbench.action.addRootFolder`). But then you have to click through all the folders again and again.
