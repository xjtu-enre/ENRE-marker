import * as vscode from 'vscode';
import path from 'path';
import { htmlAdapter } from './webPanel/htmlAdapter';
import { localMsgType, msgHandler } from './core/msgHandler';
import { ENREMarkerSerializer } from './webPanel/serializer';

export const activate = (context: vscode.ExtensionContext) => {
  let panel: vscode.WebviewPanel | undefined = undefined;

  let registerWebview = vscode.commands.registerCommand('enre-marker.start', () => {
    if (panel) {
      panel.reveal();
    } else {
      panel = vscode.window.createWebviewPanel(
        'ENREMarker',
        'ENRE-marker',
        vscode.ViewColumn.Two,
        {
          enableScripts: true,
          retainContextWhenHidden: true
        }
      );

      panel.webview.html = htmlAdapter(
        vscode.Uri.file(path.join(context.extensionPath, 'dist', 'webview.js')).with({ scheme: 'vscode-resource' }),
        vscode.Uri.file(path.join(context.extensionPath, 'dist', 'webview.css')).with({ scheme: 'vscode-resource' })
      );

      // restore state if there is
      const lastStored = context.globalState.get('webviewState');
      panel.webview.postMessage({
        command: 'restore-state',
        payload: lastStored || { url: '/' },
      });

      // let eventLock = false;
      // panel.onDidChangeViewState(({ webviewPanel: p }) => {
      //   if (!eventLock && (!p.visible || p.viewColumn !== 2)) {
      //     eventLock = true;
      //   } else {
      //     eventLock = false;
      //   }
      //   console.log('state changed with ', p.active, p.viewColumn, p.visible);
      // });

      // Handle any post-close logic in here
      panel.onDidDispose(() => {
        panel = undefined;
      },
        null,
        context.subscriptions
      );

      const setState = (state: any) => {
        context.globalState.update('webviewState', state);
      };

      const setLayout = (layout: vscode.ViewColumn) => {
        panel?.reveal(layout);
      };

      const callbackMessage = ({ command, payload }: { command: string, payload?: any }) => {
        panel?.webview.postMessage({ command, payload });
      };

      panel.webview.onDidReceiveMessage(
        ({ command, payload }: localMsgType) => {
          if (msgHandler[command] === undefined) {
            vscode.window.showErrorMessage(`Unknown message command ${command} from webview`);
            return;
          }

          const anything = msgHandler[command](payload, { setState, callbackMessage, setLayout });

          if (typeof anything !== 'undefined') {
            Promise.resolve(anything)
              .then((payload) => {
                panel?.webview.postMessage({ command: `return-${command}`, payload });
              })
              .catch((payload) => {
                panel?.webview.postMessage({ command: `return-${command}`, payload });
              });
          }
        },
        undefined,
        context.subscriptions
      );

      vscode.window.onDidChangeActiveTextEditor(e => {
        // console.log(e);
        if (panel) {
          if (!panel.visible) {
            panel.reveal(2);
          }
        }
      });

      vscode.window.onDidChangeTextEditorSelection(e => {
        const sel = e.selections[0];
        if ((e.kind === 2) && (sel.start.line === sel.end.line) && (sel.start.character !== sel.end.character)) {
          panel?.webview.postMessage({
            command: 'selection-change',
            payload: {
              name: e.textEditor.document.getText(sel),
              loc: {
                start: {
                  line: sel.start.line + 1,
                  column: sel.start.character + 1,
                },
                end: {
                  line: sel.end.line + 1,
                  column: sel.end.character + 1,
                }
              }
            }
          });
        }
      });
    }

    // return this panel in case the command is called programmatically
    return panel;
  });

  context.subscriptions.push(registerWebview);
  // this will help webview auto restart when vscode is restarted
  vscode.window.registerWebviewPanelSerializer('ENREMarker', new ENREMarkerSerializer());
};
