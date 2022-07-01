import {
  CancellationTokenSource,
  commands,
  Disposable,
  DocumentSymbol,
  events,
  ExtensionContext,
  languages,
  window,
  workspace,
} from 'coc.nvim';
import { config } from './config';
import { positionInRange } from './util/pos';
import { convertSymbols, SymbolInfo } from './util/symbol';
import { registerRuntimepath } from './util/vim';

class DocumentSymbolLine implements Disposable {
  private readonly disposables: Disposable[] = [];
  private tokenSource: CancellationTokenSource | undefined;
  private state: { [key: number]: SymbolInfo[] } = {};

  constructor() {
    workspace.onDidChangeConfiguration(() => config.setConfiguration(), this, this.disposables);
  }

  dispose(): void {
    this.disposables.forEach((d) => d.dispose());
  }

  private async getDocumentSymbols(bufnr: number): Promise<SymbolInfo[] | undefined> {
    const doc = workspace.getDocument(bufnr);
    if (!doc || !doc.attached) return;
    //@ts-ignore
    if (!languages.hasProvider('documentSymbol', doc.textDocument)) return;
    this.tokenSource?.cancel();
    this.tokenSource = new CancellationTokenSource();
    const { token } = this.tokenSource;
    //@ts-ignore
    const symbols: DocumentSymbol[] | undefined = await languages.getDocumentSymbol(doc.textDocument, token);
    if (!symbols || !symbols.length) {
      return;
    }
    return convertSymbols(symbols);
  }

  private async getSymbols(bufnr: number): Promise<SymbolInfo[] | undefined> {
    let symbols = await this.getDocumentSymbols(bufnr);
    if (!symbols || symbols.length === 0) return;

    const position = await window.getCursorPosition();
    const { showKinds } = config;
    symbols = symbols.filter(
      (s) =>
        s.range &&
        showKinds.includes(s.kind) &&
        // !s.text.endsWith(') callback') &&
        positionInRange(position, s.range) == 0
    );

    const { onlyNearestKinds } = config;
    // only need the nearest kinds
    const newSymbols: SymbolInfo[] = [];
    symbols.forEach((symbol) => {
      const count = newSymbols.length;
      const lastIdx = count - 1;
      if (count === 0) {
        newSymbols.push(symbol);
      } else if (
        (newSymbols[lastIdx].level != undefined && symbol.level != undefined
          ? newSymbols[lastIdx].level == symbol.level
          : false) ||
        (onlyNearestKinds.includes(symbol.kind) && newSymbols[lastIdx].kind == symbol.kind)
      ) {
        newSymbols[lastIdx] = symbol;
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

    const { icons, labels, default_, maxItems, separator, maxItemsIndicator } = config;

    let fullLine = '';
    let line = '';
    let addedEllipsis = false;
    const totalItems = symbols.length;

    symbols.forEach((symbol, index) => {
      let label = '';
      if (icons) {
        label = labels[symbol.kind.toLowerCase()];
        if (typeof label !== 'string') label = labels.default;
      }
      const sep = fullLine == '' ? '' : `%#CocSymbolLineSeparator#${separator}`;
      const id = `${bufnr}989${index}`;
      if (label) {
        fullLine += `%#CocSymbolLine#${sep}%#CocSymbolLine${symbol.kind}#%${id}@coc_symbol_line#click@${label} %#CocSymbolLine#${symbol.text}%X`;
      } else {
        fullLine += `%#CocSymbolLine#${sep}%#CocSymbolLine#%${id}@coc_symbol_line#click@${symbol.text}%X`;
      }

      // handle line
      if (!addedEllipsis) {
        const currentItems = index + 1;
        const leftItems = totalItems - currentItems;
        if (currentItems == maxItems && leftItems > 0) {
          addedEllipsis = true;
          line =
            fullLine + `%#CocSymbolLine#${sep}%#CocSymbolLineEllipsis#%0@coc_symbol_line#expand@${maxItemsIndicator}%X`;
        } else {
          line = fullLine;
        }
      }
    });

    if (!line) {
      if (default_ === '%f') line = `%#CocSymbolLineFile#${icons ? labels.file || '▤' : ''} %#CocSymbolLine#%f`;
      if (default_.length > 0) line = '%#CocSymbolLine#' + line;
      // not needed
      if (line) fullLine = line;
    }

    const buffer = workspace.getDocument(bufnr).buffer;
    try {
      await buffer.setVar('coc_symbol_line', line);
      await buffer.setVar('coc_symbol_line_full', fullLine);
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

  public async click(id: number, mouse: 'l' | 'm' | 'r') {
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
    if (mouse == 'l') {
      const buf = nvim.createBuffer(bufnr);
      buf.highlightRanges('symbol-line-hover', 'CocHoverRange', [symbol.selectionRange!]);
      setTimeout(() => {
        buf.clearNamespace('symbol-line-hover');
        nvim.command('redraw', true);
      }, 300);
      nvim.command('redraw', true);
    } else {
      workspace.selectRange(symbol.range);
    }
  }
}

export async function activate(context: ExtensionContext): Promise<void> {
  const { nvim } = workspace;

  await registerRuntimepath(context.extensionPath);
  await nvim.command('runtime plugin/coc_symbol_line.vim');

  const symbolLine = new DocumentSymbolLine();

  events.on(
    'CursorHold',
    async (bufnr) => {
      await symbolLine.refresh(bufnr);
    },
    null,
    context.subscriptions
  );

  const timerClean = setInterval(async () => {
    await symbolLine.clean();
  }, 10e3);

  const timerRedraw = setInterval(() => {
    workspace.nvim.command('redrawtabline', true);
  }, 500);

  context.subscriptions.push(
    // cleaner
    {
      dispose() {
        clearInterval(timerClean);
        clearInterval(timerRedraw);
      },
    },
    // command
    commands.registerCommand(
      'symbol-line._click',
      async (id, mouse) => {
        await symbolLine.click(id, mouse);
      },
      null,
      true
    ),
    // object
    symbolLine
  );
}
