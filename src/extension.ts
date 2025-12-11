import * as vscode from 'vscode';
import { KanbanPanel } from './KanbanPanel';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('flowboard.openBoard', () => {
			KanbanPanel.createOrShow(context.extensionUri);
		})
	);

	// Restore panel if VS Code restarts with it open
	if (vscode.window.registerWebviewPanelSerializer) {
		vscode.window.registerWebviewPanelSerializer(KanbanPanel.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel) {
				KanbanPanel.revive(webviewPanel, context.extensionUri);
			}
		});
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
