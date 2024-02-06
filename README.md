<img align="right" width="150" height="150" src="doc/images/icon.png">

# AddFolderToWorkspace

**AddFolderToWorkspace** is an extension that adds / removes the selected folder (multiple) to / from the workspace (VSC Workspace).

```markdown
    Of course, you can use the already built-in function:
    `Workspaces: Add Folder To Workspace...` (workbench.action.addRootFolder).
    But then you have to click through all the folders again and again.
```

| Repository | GitHub | Visual Studio Marketplace |
| ------ | ------ | ------ |
| ![GitHub release (latest by date)](https://img.shields.io/github/v/release/dennykorsukewitz/VSCode-AddFolderToWorkspace) | ![GitHub open issues](https://img.shields.io/github/issues/dennykorsukewitz/VSCode-AddFolderToWorkspace) ![GitHub closed issues](https://img.shields.io/github/issues-closed/dennykorsukewitz/VSCode-AddFolderToWorkspace?color=#44CC44) | ![Visual Studio Marketplace last-updated](https://img.shields.io/visual-studio-marketplace/last-updated/dennykorsukewitz.addfoldertoworkspace) ![Visual Studio Marketplace Version ](https://img.shields.io/visual-studio-marketplace/v/dennykorsukewitz.addfoldertoworkspace) |
| ![GitHub license](https://img.shields.io/github/license/dennykorsukewitz/VSCode-AddFolderToWorkspace) | ![GitHub pull requests](https://img.shields.io/github/issues-pr/dennykorsukewitz/VSCode-AddFolderToWorkspace?label=PR) ![GitHub closed pull requests](https://img.shields.io/github/issues-pr-closed/dennykorsukewitz/VSCode-AddFolderToWorkspace?color=g&label=PR) | ![Visual Studio Marketplace Rating release-date](https://img.shields.io/visual-studio-marketplace/release-date/dennykorsukewitz.addfoldertoworkspace) |
| ![GitHub language count](https://img.shields.io/github/languages/count/dennykorsukewitz/VSCode-AddFolderToWorkspace?style=flat&label=language)  | ![GitHub contributors](https://img.shields.io/github/contributors/dennykorsukewitz/VSCode-AddFolderToWorkspace) | ![Visual Studio Marketplace Rating (Stars)](https://img.shields.io/visual-studio-marketplace/stars/dennykorsukewitz.addfoldertoworkspace) ![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/dennykorsukewitz.addfoldertoworkspace) |
| ![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/dennykorsukewitz/VSCode-AddFolderToWorkspace)  | ![GitHub downloads](https://img.shields.io/github/downloads/dennykorsukewitz/VSCode-AddFolderToWorkspace/total?style=flat) | ![VSC marketplace download](https://img.shields.io/visual-studio-marketplace/d/dennykorsukewitz.addfoldertoworkspace) ![VSC marketplace install](https://img.shields.io/visual-studio-marketplace/i/dennykorsukewitz.addfoldertoworkspace) |

| Status |
 | ------ |
| [![GitHub commits since tagged version](https://img.shields.io/github/commits-since/dennykorsukewitz/VSCode-AddFolderToWorkspace/2.0.0/dev)](https://github.com/dennykorsukewitz/VSCode-AddFolderToWorkspace/compare/2.0.0...dev) ![GitHub Workflow Lint](https://github.com/dennykorsukewitz/VSCode-AddFolderToWorkspace/actions/workflows/lint.yml/badge.svg?branch=dev&style=flat&label=Lint) ![GitHub Workflow Pages](https://github.com/dennykorsukewitz/VSCode-AddFolderToWorkspace/actions/workflows/pages.yml/badge.svg?branch=dev&style=flat&label=GitHub%20Pages) |

## Feature

### AddFolderToWorkspace

This Function provides a searchable list of folders (Workspaces) that can be added **simultaneous** to the current VSC Workspace. All configured folders will be displayed.

**Shortcut:** ```strg + alt + k, p```<br>
**Command:**  ```AddFolderToWorkspace: Add Folder to Workspace.```

![AddFolderToWorkspace](doc/images/addfoldertoworkspace.gif)

### RemoveFolderFromWorkspace

This Function provides a searchable list of folders (Workspaces) that can be removed **simultaneous** from the current VSC Workspace. All current open folders are displayed.

**Shortcut:** ```strg + alt + k, shift + p```<br>
**Command:**  ```AddFolderToWorkspace: Remove Folder from Workspace.```

![RemoveFolderFromWorkspace](doc/images/removefolderfromworkspace.gif)

### Settings

`Preferences -> Settings -> Extensions -> AddFolderToWorkspace`

| Name | Description | Default Value |
| - | - | - |
| addFolderToWorkspace.position | If position is 'Top', the new folder will be added at the beginning of the current workspace. If position is 'Bottom', the new folder will be added at the end of the current workspace. | Bottom |
| addFolderToWorkspace.workspaces | Provides a list of folders (Workspaces) that can be added to the current VSC Workspace. | /Users/ |
| addFolderToWorkspace.recursiveWorkspaces | Provides a searchable (only first level) list of folders  (Workspaces) that can be added to the current VSC Workspace. | /Users/ |

![Settings](doc/images/settings.png)

---

## Installation

To install this extension, you have **three** options:

### 1. Search Extension in Marketplace

Search and install online extension via VSC extensions menu.

`Code` -> `Preferences` -> `Extensions` simply search for `AddFolderToWorkspace` to install.

### 2. Install via vsix file

Download latest [vsix file](https://github.com/dennykorsukewitz/VSCode-AddFolderToWorkspace/releases) and install via extensions menu.

`Code` -> `Preferences` -> `Extensions` -> `Views and More Action` -> `Install from VSIX`.

### 3. Source code

Download archive with the latest [release](https://github.com/dennykorsukewitz/VSCode-AddFolderToWorkspace/releases) and unpack it to VisualStudioCode extensions folder
`$HOME/.vscode/extensions/`.

---

## Download

For download see [VSCode-AddFolderToWorkspace](https://github.com/dennykorsukewitz/VSCode-AddFolderToWorkspace/releases)

---

Enjoy!

Your [Denny Korsukéwitz](https://github.com/dennykorsukewitz) 🚀
