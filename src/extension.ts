'use strict';
import * as vscode from 'vscode';

let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(ctx: vscode.ExtensionContext): void {
    diagnosticCollection = vscode.languages.createDiagnosticCollection('ndjson');
    ctx.subscriptions.push(diagnosticCollection);

    ctx.subscriptions.push(vscode.workspace.onDidSaveTextDocument(runDiagnostics));
    ctx.subscriptions.push(vscode.workspace.onDidOpenTextDocument(runDiagnostics));
}

const runDiagnostics = (document: vscode.TextDocument) => {
    if (!document) return;
    if (document.languageId === 'ndjson') {
        checkDiagnostics(document);
    }
}

export function checkDiagnostics(document: vscode.TextDocument): void {
    diagnosticCollection.clear();

    const jsons = document.getText().split('\n');
    const errors = [];
    jsons.forEach((json, index) => {
        if (/^\s*$/.test(json)) return;
        try {
            JSON.parse(json);
        } catch (err) {
            errors.push([index, err.message])
        }
    })
    const diagnostics = errors.map(([index, err]) => {
        const textline = document.lineAt(index)
        return new vscode.Diagnostic(
            textline.range, `line ${index + 1} - Is not a valid json (${err}).`,
            vscode.DiagnosticSeverity.Error
        );
    })
    diagnosticCollection.set(document.uri, diagnostics);
}
