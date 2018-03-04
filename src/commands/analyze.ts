import * as vscode from 'vscode';
const { spawn } = require('child_process');

export default function analyzeCode(document: vscode.TextDocument, context: vscode.ExtensionContext): void { // } Promise<any> {
    
    // run the ant command against the file and output the values
    const buildFile: string = vscode.workspace.rootPath + '\\lib\\PMD\\bin';
//    const child = spawn('pmd.bat', ['RunPMD'], { cwd: buildFile} );
    const child = spawn('ant.bat', ['RunPMD'], { cwd: buildFile} );

    child.on('exit', function (code, signal) {
        console.log('child process exited with ' +
                    `code ${code} and signal ${signal}`);
      });

    
}