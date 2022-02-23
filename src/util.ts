import { SymbolKind, DocumentSymbol, Range, Position, TextEdit } from 'vscode-languageserver-protocol';

export function rangeInRange(r: Range, range: Range): boolean {
  return positionInRange(r.start, range) === 0 && positionInRange(r.end, range) === 0;
}

/**
 * Check if two ranges have overlap character.
 */
export function rangeOverlap(r: Range, range: Range): boolean {
  const { start, end } = r;
  if (comparePosition(end, range.start) <= 0) {
    return false;
  }
  if (comparePosition(start, range.end) >= 0) {
    return false;
  }
  return true;
}

/**
 * Check if two ranges have overlap or nested
 */
export function rangeIntersect(r: Range, range: Range): boolean {
  if (positionInRange(r.start, range) == 0) {
    return true;
  }
  if (positionInRange(r.end, range) == 0) {
    return true;
  }
  if (rangeInRange(range, r)) {
    return true;
  }
  return false;
}

export function lineInRange(line: number, range: Range): boolean {
  const { start, end } = range;
  return line >= start.line && line <= end.line;
}

export function emptyRange(range: Range): boolean {
  const { start, end } = range;
  return start.line == end.line && start.character == end.character;
}

export function positionInRange(position: Position, range: Range): number {
  const { start, end } = range;
  if (comparePosition(position, start) < 0) return -1;
  if (comparePosition(position, end) > 0) return 1;
  return 0;
}

export function comparePosition(position: Position, other: Position): number {
  if (position.line > other.line) return 1;
  if (other.line == position.line && position.character > other.character) return 1;
  if (other.line == position.line && position.character == other.character) return 0;
  return -1;
}

export function isSingleLine(range: Range): boolean {
  return range.start.line == range.end.line;
}

export function getChangedPosition(start: Position, edit: TextEdit): { line: number; character: number } {
  const { range, newText } = edit;
  if (comparePosition(range.end, start) <= 0) {
    const lines = newText.split('\n');
    const lineCount = lines.length - (range.end.line - range.start.line) - 1;
    let characterCount = 0;
    if (range.end.line == start.line) {
      const single = isSingleLine(range) && lineCount == 0;
      const removed = single ? range.end.character - range.start.character : range.end.character;
      const added = single ? newText.length : lines[lines.length - 1].length;
      characterCount = added - removed;
    }
    return { line: lineCount, character: characterCount };
  }
  return { line: 0, character: 0 };
}

export function adjustPosition(pos: Position, edit: TextEdit): Position {
  const { range, newText } = edit;
  if (comparePosition(range.start, pos) > 1) return pos;
  const { start, end } = range;
  const newLines = newText.split('\n');
  const delta = end.line - start.line - newLines.length + 1;
  const lastLine = newLines[newLines.length - 1];
  const line = pos.line - delta;
  if (pos.line != end.line) return { line, character: pos.character };
  const pre = newLines.length == 1 && start.line != end.line ? start.character : 0;
  const removed = start.line == end.line && newLines.length == 1 ? end.character - start.character : end.character;
  const character = pre + pos.character + lastLine.length - removed;
  return {
    line,
    character,
  };
}

export function positionToOffset(lines: string[], line: number, character: number): number {
  let offset = 0;
  for (let i = 0; i <= line; i++) {
    if (i == line) {
      offset += character;
    } else {
      offset += lines[i].length + 1;
    }
  }
  return offset;
}

// edit a range to newText
export function editRange(range: Range, text: string, edit: TextEdit): string {
  // outof range
  if (!rangeInRange(edit.range, range)) return text;
  const { start, end } = edit.range;
  const lines = text.split('\n');
  let character = start.line == range.start.line ? start.character - range.start.character : start.character;
  const startOffset = positionToOffset(lines, start.line - range.start.line, character);
  character = end.line == range.start.line ? end.character - range.start.character : end.character;
  const endOffset = positionToOffset(lines, end.line - range.start.line, character);
  return `${text.slice(0, startOffset)}${edit.newText}${text.slice(endOffset, text.length)}`;
}

export function getChangedFromEdits(start: Position, edits: TextEdit[]): Position | null {
  let changed = { line: 0, character: 0 };
  for (const edit of edits) {
    const d = getChangedPosition(start, edit);
    changed = { line: changed.line + d.line, character: changed.character + d.character };
  }
  return changed.line == 0 && changed.character == 0 ? null : changed;
}

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

export function convertSymbols(symbols: DocumentSymbol[]): SymbolInfo[] {
  const res: SymbolInfo[] = [];
  const arr = symbols.slice();
  arr.sort(sortDocumentSymbols);
  arr.forEach((s) => addDocumentSymbol(res, s, 0));
  return res;
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
