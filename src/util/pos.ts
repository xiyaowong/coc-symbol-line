import { Range, Position, TextEdit } from 'vscode-languageserver-protocol';

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
