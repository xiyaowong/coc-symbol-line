import { SymbolInformation } from 'coc.nvim';
import { SymbolKind, DocumentSymbol, Range } from 'vscode-languageserver-protocol';
import { comparePosition } from './pos';

export interface SymbolInfo {
  filepath?: string;
  lnum: number;
  col: number;
  text: string;
  kind: string;
  level?: number;
  containerName?: string;
  range: Range;
  selectionRange?: Range;
}

export function getSymbolKind(kind: SymbolKind): string {
  switch (kind) {
    case SymbolKind.File:
      return 'File';
    case SymbolKind.Module:
      return 'Module';
    case SymbolKind.Namespace:
      return 'Namespace';
    case SymbolKind.Package:
      return 'Package';
    case SymbolKind.Class:
      return 'Class';
    case SymbolKind.Method:
      return 'Method';
    case SymbolKind.Property:
      return 'Property';
    case SymbolKind.Field:
      return 'Field';
    case SymbolKind.Constructor:
      return 'Constructor';
    case SymbolKind.Enum:
      return 'Enum';
    case SymbolKind.Interface:
      return 'Interface';
    case SymbolKind.Function:
      return 'Function';
    case SymbolKind.Variable:
      return 'Variable';
    case SymbolKind.Constant:
      return 'Constant';
    case SymbolKind.String:
      return 'String';
    case SymbolKind.Number:
      return 'Number';
    case SymbolKind.Boolean:
      return 'Boolean';
    case SymbolKind.Array:
      return 'Array';
    case SymbolKind.Object:
      return 'Object';
    case SymbolKind.Key:
      return 'Key';
    case SymbolKind.Null:
      return 'Null';
    case SymbolKind.EnumMember:
      return 'EnumMember';
    case SymbolKind.Struct:
      return 'Struct';
    case SymbolKind.Event:
      return 'Event';
    case SymbolKind.Operator:
      return 'Operator';
    case SymbolKind.TypeParameter:
      return 'TypeParameter';
    default:
      return 'Unknown';
  }
}

export function isSymbols(symbols: DocumentSymbol[] | SymbolInformation[]): symbols is DocumentSymbol[] {
  return !symbols[0].hasOwnProperty('location');
}

export function convertSymbols(symbols: DocumentSymbol[] | SymbolInformation[]): SymbolInfo[] {
  const res: SymbolInfo[] = [];
  if (isSymbols(symbols)) {
    const arr = symbols.slice();
    arr.sort(sortDocumentSymbols);
    arr.forEach((s) => addDocumentSymbol(res, s, 0));
  } else {
    const arr = symbols.slice();
    arr.sort(sortSymbols);
    arr.forEach((s) => addSymbol(res, s));
  }
  return res;
}

export function sortSymbols(a: SymbolInformation, b: SymbolInformation): number {
  const sa = a.location.range.start;
  const sb = b.location.range.start;
  const d = sa.line - sb.line;
  return d == 0 ? sa.character - sb.character : d;
}

export function addSymbol(res: SymbolInfo[], sym: SymbolInformation) {
  res.push({
    col: sym.location.range.start.character + 1,
    lnum: sym.location.range.start.line + 1,
    text: sym.name,
    kind: getSymbolKind(sym.kind),
    range: sym.location.range,
    selectionRange: sym.location.range,
  });
}

export function sortDocumentSymbols(a: DocumentSymbol, b: DocumentSymbol): number {
  const ra = a.selectionRange;
  const rb = b.selectionRange;
  return comparePosition(ra.start, rb.start);
}

export function addDocumentSymbol(res: SymbolInfo[], sym: DocumentSymbol, level: number): void {
  const { name, selectionRange, kind, children, range } = sym;
  const { start } = selectionRange || range;
  res.push({
    col: start.character + 1,
    lnum: start.line + 1,
    text: name,
    level,
    kind: getSymbolKind(kind),
    range,
    selectionRange,
  });
  if (children && children.length) {
    children.sort(sortDocumentSymbols);
    for (const sym of children) {
      addDocumentSymbol(res, sym, level + 1);
    }
  }
}
