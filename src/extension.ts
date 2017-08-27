import * as vscode from 'vscode';
import { ForceService } from './services';
import ForceCodeContentProvider from './providers/ContentProvider';
import ForceCodeLogProvider from './providers/LogProvider';
import ApexCompletionProvider from './providers/ApexCompletion';
import { editorUpdateApexCoverageDecorator, documentUpdateApexCoverageDecorator } from './decorators/testCoverageDecorator';
import * as commands from './commands';
import * as parsers from './parsers';
import { updateDecorations } from './decorators/testCoverageDecorator';
import path = require('path');

export function activate(context: vscode.ExtensionContext): any {
    vscode.window.forceCode = new ForceService();

    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('forcecode', new ForceCodeContentProvider()));
    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider('sflog', new ForceCodeLogProvider()));
 
    context.subscriptions.push(vscode.commands.registerCommand('ForceCode.documentMethod', () => {
        commands.documentMethod(context);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('ForceCode.showMenu', () => {
        commands.showMenu(context);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('ForceCode.executeAnonymous', () => {
        commands.executeAnonymous(vscode.window.activeTextEditor.document, context);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('ForceCode.getLog', () => {
        commands.getLog(context);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('ForceCode.open', (selectedResource?: vscode.Uri) => {
        if (selectedResource.path) {
            vscode.workspace.openTextDocument(selectedResource).then(doc => commands.compile(doc, context));
        } else {
            commands.compile(vscode.window.activeTextEditor.document, context);
        }
        commands.open(context);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('ForceCode.retrievePackage', () => {
        commands.retrieve(context);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('ForceCode.staticResource', () => {
        commands.staticResource(context);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('ForceCode.apexTest', () => {
        commands.apexTest(vscode.window.activeTextEditor.document, context);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('ForceCode.refresh', (selectedResource?: vscode.Uri) => {
        commands.retrieve(context, selectedResource);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('ForceCode.compile', (selectedResource?: vscode.Uri) => {
        if (selectedResource.path) {
            vscode.workspace.openTextDocument(selectedResource)
                .then(doc => commands.compile(doc, context));
        } else {
            commands.compile(vscode.window.activeTextEditor.document, context);
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('ForceCode.diff', () => {
        commands.diff(vscode.window.activeTextEditor.document, context);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('ForceCode.toggleCoverage', () => {
        vscode.window.forceCode.config.showTestCoverage = !vscode.window.forceCode.config.showTestCoverage;
        updateDecorations();
    }));

    // AutoCompile Feature
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument((textDocument: vscode.TextDocument) => {
        const toolingType: string = parsers.getToolingType(textDocument);
        if (toolingType && vscode.window.forceCode.config && vscode.window.forceCode.config.autoCompile === true) {
            commands.compile(textDocument, context);
        }  

        var folderExtension: string =  vscode.window.forceCode.config.staticResourceOptions && 
                                       vscode.window.forceCode.config.staticResourceOptions.folderExtension != null ? 
                                       vscode.window.forceCode.config.staticResourceOptions.folderExtension : '.resource';

        var resourceFolderRegEx: RegExp = new RegExp("resource\\-bundles.*" + (folderExtension.length > 0 ? "\\" : "" ) + folderExtension + ".*$");

        var isResource: RegExpMatchArray = textDocument.fileName.match(resourceFolderRegEx); // We are in a resource-bundles folder, bundle and deploy the staticResource
        if (isResource.index && vscode.window.forceCode.config && vscode.window.forceCode.config.autoCompile === true) {
            // check if the type of file modified is supposed to be ignored.
            if( vscode.window.forceCode.config.staticResourceOptions && 
                vscode.window.forceCode.config.staticResourceOptions.ignoreTypes != null){
                    var types: string[] = vscode.window.forceCode.config.staticResourceOptions.ignoreTypes.split(',');
                    if( !types.find( a => { return a.toLowerCase() == textDocument.fileName.toLowerCase(); })) {
                        return;
                    }
                } 
                
            commands.staticResourceDeployFromFile(textDocument.fileName, context);
        }
    }));

    function fileWatchAutoBundle( filePath: vscode.Uri ) {
        // check if the type of file modified is supposed to be ignored.
        if( vscode.window.forceCode.config.staticResourceOptions && 
            vscode.window.forceCode.config.staticResourceOptions.ignoreTypes != null){
                var types: string[] = vscode.window.forceCode.config.staticResourceOptions.ignoreTypes.split(',');

                var fileName:string = filePath.fsPath.replace(/^.*[\\\/]/, '');
                var type = fileName.split['.'][1];

                // parse out the type
                if( !types.find( a => { return type.toLowerCase() == fileName.toLowerCase(); })) {
                    return;
                }
            } 
            
        commands.staticResourceDeployFromFile(filePath.fsPath, context);
    }
    
    // setup the resource bundle folder watchers
    var sf: vscode.FileSystemWatcher = vscode.workspace.createFileSystemWatcher("**/resource-bundles/**");
    sf.onDidChange(fileWatchAutoBundle);
    sf.onDidCreate(fileWatchAutoBundle);
    sf.onDidDelete(fileWatchAutoBundle);
    
    // Code Completion Provider
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('apex', new ApexCompletionProvider(), '.', '@'));

    // Text Coverage Decorators
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editorUpdateApexCoverageDecorator));
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(documentUpdateApexCoverageDecorator));


    // // Peek Provider Setup
    // const peekProvider: any = new commands.PeekFileDefinitionProvider();
    // const definitionProvider: any = vscode.languages.registerDefinitionProvider(constants.PEEK_FILTER, peekProvider);
    // context.subscriptions.push(definitionProvider);
}
