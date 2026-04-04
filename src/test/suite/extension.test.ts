import * as assert from 'assert';
import * as vscode from 'vscode';

suite('AddFolderToWorkspace extension', () => {
    test('Extension is installed for this test run', () => {
        const ext = vscode.extensions.all.find(
            (e) => e.packageJSON.name === 'AddFolderToWorkspace',
        );
        assert.ok(ext, 'Expected AddFolderToWorkspace in development host');
    });

    test('Extension activates without throwing', async () => {
        const ext = vscode.extensions.all.find(
            (e) => e.packageJSON.name === 'AddFolderToWorkspace',
        );
        assert.ok(ext);
        await ext.activate();
    });

    test('Commands are registered after activation', async () => {
        const ext = vscode.extensions.all.find(
            (e) => e.packageJSON.name === 'AddFolderToWorkspace',
        );
        assert.ok(ext);
        await ext.activate();

        const commands = await vscode.commands.getCommands(true);
        assert.ok(
            commands.includes('addFolderToWorkspace'),
            'addFolderToWorkspace should be registered',
        );
        assert.ok(
            commands.includes('removeFolderFromWorkspace'),
            'removeFolderFromWorkspace should be registered',
        );
        assert.ok(
            commands.includes('addRecentFoldersToWorkspace'),
            'addRecentFoldersToWorkspace should be registered',
        );
        assert.ok(
            commands.includes('clearRecentFoldersToWorkspace'),
            'clearRecentFoldersToWorkspace should be registered',
        );
    });

    test('addFolderToWorkspace configuration is readable', async () => {
        const ext = vscode.extensions.all.find(
            (e) => e.packageJSON.name === 'AddFolderToWorkspace',
        );
        assert.ok(ext);
        await ext.activate();

        const cfg = vscode.workspace.getConfiguration('addFolderToWorkspace');
        const position = cfg.get<string>('position');
        assert.ok(position === 'Top' || position === 'Bottom', 'position enum');

        const workspaces = cfg.get<string[]>('workspaces');
        assert.ok(Array.isArray(workspaces), 'workspaces should be an array');

        const recursive = cfg.get<string[]>('recursiveWorkspaces');
        assert.ok(Array.isArray(recursive), 'recursiveWorkspaces should be an array');

        const recentFoldersCount = cfg.get<number>('recentFoldersCount');
        assert.ok(
            typeof recentFoldersCount === 'number' && recentFoldersCount >= 0,
            'recentFoldersCount should be a non-negative number',
        );
    });
});
