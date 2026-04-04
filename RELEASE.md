# [2.1.0] - 2026-04-04

## Added

- Command **Add Recent Folders to Workspace** (`addRecentFoldersToWorkspace`) to pick from the saved recent list only; default keybinding `Ctrl+Alt+K R` (`Cmd+Alt+K R` on macOS where applicable).
- Command **Clear Recent Folders List** (`clearRecentFoldersToWorkspace`) to remove all entries from the global recent list.
- Setting `addFolderToWorkspace.recentFoldersCount` (default `5`, minimum `0`) to control how many recently added folders are pinned at the top of the **Add Folder to Workspace** quick pick. When set to `0`, that pinned section is hidden and recent paths are not persisted.
- Global recent-folder history in extension `globalState` under `addFolderToWorkspace.recentPaths` (per user profile, not per workspace file).

## Changed

- **Add Folder to Workspace** quick pick order: recent entries (if any and limit > 0), the manual directory option, then configured and recursive workspace directories (duplicates with the recent section omitted).
- When the manual directory option is used together with other selections, it is removed by index instead of `Array.shift()`, so behavior stays correct when recent rows appear above the manual row.
- Adding folders (main command and **Add Recent Folders**) now persists the global recent list right after `updateWorkspaceFolders` accepts the update, then waits for the workspace-folder change event. That order avoids missing or delayed `onDidChangeWorkspaceFolders` so recent paths update reliably on the first run.
