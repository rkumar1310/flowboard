import * as vscode from 'vscode';
import { readBoard, writeBoard } from './boardFile';
import { MessageToExtension, Board } from './types';

export class KanbanPanel {
	public static currentPanel: KanbanPanel | undefined;
	public static readonly viewType = 'flowboard.kanbanPanel';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];
	private _debounceTimer: NodeJS.Timeout | undefined;

	public static createOrShow(extensionUri: vscode.Uri) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		if (KanbanPanel.currentPanel) {
			KanbanPanel.currentPanel._panel.reveal(column);
			return;
		}

		const panel = vscode.window.createWebviewPanel(
			KanbanPanel.viewType,
			'Flowboard',
			column || vscode.ViewColumn.One,
			{
				enableScripts: true,
				localResourceRoots: [
					vscode.Uri.joinPath(extensionUri, 'dist', 'webview'),
				],
				retainContextWhenHidden: true,
			}
		);

		KanbanPanel.currentPanel = new KanbanPanel(panel, extensionUri);
	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		KanbanPanel.currentPanel = new KanbanPanel(panel, extensionUri);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
		this._extensionUri = extensionUri;

		this._update();

		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		this._panel.webview.onDidReceiveMessage(
			async (message: MessageToExtension) => {
				switch (message.type) {
					case 'ready':
						await this._loadBoard();
						break;
					case 'updateBoard':
						this._debouncedSaveBoard(message.board);
						break;
				}
			},
			null,
			this._disposables
		);

		// Watch for changes to FLOWBOARD.md
		const watcher = vscode.workspace.createFileSystemWatcher('**/FLOWBOARD.md');
		watcher.onDidChange(() => this._loadBoard());
		watcher.onDidCreate(() => this._loadBoard());
		watcher.onDidDelete(() => this._loadBoard());
		this._disposables.push(watcher);
	}

	private async _loadBoard() {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || workspaceFolders.length === 0) {
			this._panel.webview.postMessage({ type: 'noWorkspace' });
			return;
		}

		const board = await readBoard();
		this._panel.webview.postMessage({ type: 'loadBoard', board });
	}

	private _debouncedSaveBoard(board: Board) {
		if (this._debounceTimer) {
			clearTimeout(this._debounceTimer);
		}
		this._debounceTimer = setTimeout(async () => {
			await writeBoard(board);
		}, 300);
	}

	public dispose() {
		KanbanPanel.currentPanel = undefined;

		if (this._debounceTimer) {
			clearTimeout(this._debounceTimer);
		}

		this._panel.dispose();

		while (this._disposables.length) {
			const disposable = this._disposables.pop();
			if (disposable) {
				disposable.dispose();
			}
		}
	}

	private _update() {
		this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		const scriptUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview', 'assets', 'index.js')
		);
		const styleUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview', 'assets', 'index.css')
		);

		const nonce = getNonce();

		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link href="${styleUri}" rel="stylesheet">
	<title>Flowboard</title>
</head>
<body>
	<div id="root"></div>
	<script type="module" nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
