To generate installable vsix file 
1. run vsce package from bash shell
2. Install vsix package from within extension view.


Had issues with installing vscode package.  issue with ssl not being able to obtain a certificate.  
Fixed by 
- changing the npm config strict-ssl to false. 
- from the command line type: 
    set NODE_TLS_REJECT_UNAUTHORIZED=0
    code . -- this will restart vscode so the env var is reloaded.
    
