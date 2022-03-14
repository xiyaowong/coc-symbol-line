import {
  CancellationTokenSource,
  DocumentSymbol,
  events,
  window,
  ExtensionContext,
  languages,
  workspace,
  commands,
} from 'coc.nvim';
import { positionInRange } from './util/pos';
import { convertSymbols, SymbolInfo } from './util/symbol';
import { registerRuntimepath } from './util/vim';

class DocumentSymbolLine {
  private tokenSource: CancellationTokenSource | undefined;
  private state: { [key: number]: SymbolInfo[] } = {};
  public get labels(): { [key: string]: string } {
    return workspace.getConfiguration('suggest').get<any>('completionItemKindLabels', {});
  }

  public async getDocumentSymbols(bufnr: number): Promise<SymbolInfo[] | undefined> {
    const doc = workspace.getDocument(bufnr);
    if (!doc || !doc.attached) return;
    //@ts-ignore
    if (!languages.hasProvider('documentSymbol', doc.textDocument)) return;
    this.tokenSource?.cancel();
    this.tokenSource = new CancellationTokenSource();
    const { token } = this.tokenSource;
    //@ts-ignore
    const symbols: DocumentSymbol[] | undefined = await languages.getDocumentSymbol(doc.textDocument, token);
    if (!symbols) {
      return;
    }
    return convertSymbols(symbols);
  }

  public async getSymbols(bufnr: number): Promise<SymbolInfo[] | undefined> {
    let symbols = await this.getDocumentSymbols(bufnr);
    if (!symbols || symbols.length === 0) return;

    const position = await window.getCursorPosition();
    symbols = symbols.filter(
      (s) =>
        s.range &&
        ['Class', 'Method', 'Function', 'Struct', 'Property', 'Variable'].includes(s.kind) &&
        !s.text.endsWith(') callback') &&
        positionInRange(position, s.range) == 0
    );

    // only need the nearest variable, property
    const newSymbols: SymbolInfo[] = [];
    symbols.forEach((symbol) => {
      const count = newSymbols.length;
      if (count === 0) {
        newSymbols.push(symbol);
      } else if (['Variable'].includes(symbol.kind) && newSymbols[count - 1].kind == symbol.kind) {
        newSymbols[count - 1] = symbol;
      } else {
        newSymbols.push(symbol);
      }
    });

    return newSymbols;
  }

  public async refresh(bufnr: number) {
    const symbols = await this.getSymbols(bufnr);
    if (!symbols) return;
    this.state[bufnr] = symbols;

    let line = '';
    symbols.forEach((symbol, index) => {
      const label = this.labels[symbol.kind.toLowerCase()];
      const sep = line == '' ? '' : ' > ';
      const id = `${bufnr}989${index}`;
      if (label) {
        line += `%#CocSymbolLine#${sep}%#CocSymbolLine${symbol.kind}#${label} %#CocSymbolLine#%${id}@coc_symbol_line#click@${symbol.text}%X`;
      } else {
        line += `%#CocSymbolLine#${sep}%#CocSymbolLine#%${id}@coc_symbol_line#click@${symbol.text}%X`;
      }
    });
    if (line == '') {
      line = `%#CocSymbolLineFile#${this.labels.file || '▤'} %#CocSymbolLine#%f`;
    }
    const buffer = workspace.getDocument(bufnr).buffer;
    try {
      await buffer.setVar('coc_symbol_line', line);
    } catch (e) {}
  }

  public async clean() {
    Object.keys(this.state).forEach(async (bufnr) => {
      const exists = await workspace.nvim.call('bufexists', Number(bufnr));
      if (exists != 1) {
        delete this.state[bufnr];
      }
    });
  }

  public async click(id: number) {
    const items = id
      .toString()
      .split('989')
      .map((v) => Number.parseInt(v));

    const bufnr = items[0];
    const index = items[1];

    const { nvim } = workspace;

    const winid = await nvim.call('bufwinid', bufnr);
    if (winid == -1) return;
    nvim.call('win_gotoid', winid, true);

    const symbol = this.state[bufnr][index];

    const pos = symbol.selectionRange!.start;
    nvim.call('coc#cursor#move_to', [pos.line, pos.character], true);
    nvim.command(`normal! zz`, true);
    const buf = nvim.createBuffer(bufnr);
    buf.highlightRanges('symbol-line-hover', 'CocHoverRange', [symbol.selectionRange!]);
    setTimeout(() => {
      buf.clearNamespace('symbol-line-hover');
      nvim.command('redraw', true);
    }, 300);
    nvim.command('redraw', true);
  }
}

export async function activate(context: ExtensionContext): Promise<void> {
  const { nvim } = workspace;

  await registerRuntimepath(context.extensionPath);
  await nvim.command('runtime plugin/coc_symbol_line.vim');

  const hasWinBar = (await nvim.call('exists', '*nvim__win_set_bar')) == 1;
  const symbolLine = new DocumentSymbolLine();
  let wins: number[] = [];

  events.on(
    'CursorHold',
    async (bufnr) => {
      if (hasWinBar) {
        const winid = await nvim.call('bufwinid', bufnr);
        const doc = workspace.getDocument(bufnr);
        if (!wins.includes(winid) && doc && doc.attached) {
          nvim.call('nvim__win_set_bar', [winid, true, '%{%get(b:, "coc_symbol_line", "%#CocSymbolLine#")%}'], true);
          wins.push(winid);
        }
      }
      await symbolLine.refresh(bufnr);
    },
    null,
    context.subscriptions
  );

  const timer = setInterval(async () => {
    const validWins: number[] = [];
    wins.forEach(async (win) => {
      const wininfo = await nvim.call('getwininfo', win);
      if (wininfo && wininfo.length > 0) validWins.push(win);
    });
    wins = validWins;

    await symbolLine.clean();
  }, 10e3);

  const timerRedraw = setInterval(() => {
    workspace.nvim.command('redrawtabline', true);
  }, 500);

  context.subscriptions.push({
    dispose() {
      clearInterval(timer);
      clearInterval(timerRedraw);
    },
  });

  context.subscriptions.push(
    commands.registerCommand(
      'symbol-line._click',
      async (id: number) => {
        await symbolLine.click(id);
      },
      null,
      true
    )
  );
}
