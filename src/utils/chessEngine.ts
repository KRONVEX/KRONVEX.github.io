export type Color = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PromotionPiece = 'q' | 'r' | 'b' | 'n';
export type AiDifficulty = 'scout' | 'tactical' | 'apex';

export interface Piece {
  type: PieceType;
  color: Color;
}

export interface CastlingRights {
  wK: boolean;
  wQ: boolean;
  bK: boolean;
  bQ: boolean;
}

export interface ChessMove {
  from: number;
  to: number;
  piece: PieceType;
  captured?: PieceType;
  promotion?: PromotionPiece;
  isEnPassant?: boolean;
  isCastle?: 'K' | 'Q';
}

export interface MoveRecord {
  move: ChessMove;
  san: string;
  color: Color;
  moveNumber: number;
}

export interface ChessState {
  board: (Piece | null)[];
  turn: Color;
  castling: CastlingRights;
  enPassant: number | null;
  halfMoveClock: number;
  fullMoveNumber: number;
  history: MoveRecord[];
}

export interface GameStatus {
  kind: 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw-50' | 'draw-insufficient';
  winner?: Color;
  inCheck: boolean;
  kingSq: number;
}

export interface AiSearchResult {
  move: ChessMove | null;
  scoreCp: number; // Centipawns from White's perspective
  nodes: number;
  elapsedMs: number;
}

const FILES = 'abcdefgh';
const RANKS = '87654321';

export function sqToAlg(sq: number): string {
  return FILES[sq & 7] + RANKS[sq >> 3];
}

export function algToSq(alg: string): number {
  const col = FILES.indexOf(alg[0]);
  const row = RANKS.indexOf(alg[1]);
  return (row << 3) | col;
}

export function opposite(color: Color): Color {
  return color === 'w' ? 'b' : 'w';
}

export function createInitialState(): ChessState {
  const board: (Piece | null)[] = new Array(64).fill(null);
  const backRank: PieceType[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];

  for (let c = 0; c < 8; c++) {
    board[c] = { type: backRank[c], color: 'b' };
    board[8 + c] = { type: 'p', color: 'b' };
    board[48 + c] = { type: 'p', color: 'w' };
    board[56 + c] = { type: backRank[c], color: 'w' };
  }

  return {
    board,
    turn: 'w',
    castling: { wK: true, wQ: true, bK: true, bQ: true },
    enPassant: null,
    halfMoveClock: 0,
    fullMoveNumber: 1,
    history: [],
  };
}

export function cloneState(s: ChessState): ChessState {
  return {
    board: s.board.slice(),
    turn: s.turn,
    castling: { ...s.castling },
    enPassant: s.enPassant,
    halfMoveClock: s.halfMoveClock,
    fullMoveNumber: s.fullMoveNumber,
    history: s.history.slice(),
  };
}

const KNIGHT_DIRS = [
  [-2, -1],
  [-2, 1],
  [-1, -2],
  [-1, 2],
  [1, -2],
  [1, 2],
  [2, -1],
  [2, 1],
];

const KING_DIRS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

const BISHOP_DIRS = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];

const ROOK_DIRS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

export function findKing(board: (Piece | null)[], color: Color): number {
  for (let i = 0; i < 64; i++) {
    const p = board[i];
    if (p && p.type === 'k' && p.color === color) return i;
  }
  return -1;
}

export function isSquareAttacked(board: (Piece | null)[], sq: number, byColor: Color): boolean {
  const r = sq >> 3;
  const c = sq & 7;

  // Pawn attacks
  const pawnRow = byColor === 'w' ? r + 1 : r - 1;
  if (pawnRow >= 0 && pawnRow < 8) {
    if (c > 0) {
      const p = board[(pawnRow << 3) | (c - 1)];
      if (p && p.color === byColor && p.type === 'p') return true;
    }
    if (c < 7) {
      const p = board[(pawnRow << 3) | (c + 1)];
      if (p && p.color === byColor && p.type === 'p') return true;
    }
  }

  // Knight attacks
  for (let i = 0; i < KNIGHT_DIRS.length; i++) {
    const nr = r + KNIGHT_DIRS[i][0];
    const nc = c + KNIGHT_DIRS[i][1];
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const p = board[(nr << 3) | nc];
      if (p && p.color === byColor && p.type === 'n') return true;
    }
  }

  // King attacks
  for (let i = 0; i < KING_DIRS.length; i++) {
    const nr = r + KING_DIRS[i][0];
    const nc = c + KING_DIRS[i][1];
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const p = board[(nr << 3) | nc];
      if (p && p.color === byColor && p.type === 'k') return true;
    }
  }

  // Diagonal sliders (Bishop / Queen)
  for (let i = 0; i < BISHOP_DIRS.length; i++) {
    let nr = r + BISHOP_DIRS[i][0];
    let nc = c + BISHOP_DIRS[i][1];
    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const p = board[(nr << 3) | nc];
      if (p) {
        if (p.color === byColor && (p.type === 'b' || p.type === 'q')) return true;
        break;
      }
      nr += BISHOP_DIRS[i][0];
      nc += BISHOP_DIRS[i][1];
    }
  }

  // Orthogonal sliders (Rook / Queen)
  for (let i = 0; i < ROOK_DIRS.length; i++) {
    let nr = r + ROOK_DIRS[i][0];
    let nc = c + ROOK_DIRS[i][1];
    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const p = board[(nr << 3) | nc];
      if (p) {
        if (p.color === byColor && (p.type === 'r' || p.type === 'q')) return true;
        break;
      }
      nr += ROOK_DIRS[i][0];
      nc += ROOK_DIRS[i][1];
    }
  }

  return false;
}

function generatePseudoLegalMoves(state: ChessState, capturesOnly = false): ChessMove[] {
  const moves: ChessMove[] = [];
  const { board, turn, castling, enPassant } = state;
  const enemy = opposite(turn);

  for (let sq = 0; sq < 64; sq++) {
    const piece = board[sq];
    if (!piece || piece.color !== turn) continue;
    const r = sq >> 3;
    const c = sq & 7;

    if (piece.type === 'p') {
      const dir = turn === 'w' ? -1 : 1;
      const startRow = turn === 'w' ? 6 : 1;
      const promoRow = turn === 'w' ? 0 : 7;
      const nr = r + dir;

      if (nr >= 0 && nr < 8) {
        // Forward pushes
        if (!capturesOnly) {
          const oneSq = (nr << 3) | c;
          if (!board[oneSq]) {
            if (nr === promoRow) {
              for (const promo of ['q', 'r', 'b', 'n'] as PromotionPiece[]) {
                moves.push({ from: sq, to: oneSq, piece: 'p', promotion: promo });
              }
            } else {
              moves.push({ from: sq, to: oneSq, piece: 'p' });
              if (r === startRow) {
                const twoSq = ((r + dir * 2) << 3) | c;
                if (!board[twoSq]) {
                  moves.push({ from: sq, to: twoSq, piece: 'p' });
                }
              }
            }
          }
        }

        // Captures & En Passant
        for (const dc of [-1, 1]) {
          const nc = c + dc;
          if (nc < 0 || nc > 7) continue;
          const capSq = (nr << 3) | nc;
          const target = board[capSq];
          if (target && target.color === enemy) {
            if (nr === promoRow) {
              for (const promo of ['q', 'r', 'b', 'n'] as PromotionPiece[]) {
                moves.push({ from: sq, to: capSq, piece: 'p', captured: target.type, promotion: promo });
              }
            } else {
              moves.push({ from: sq, to: capSq, piece: 'p', captured: target.type });
            }
          } else if (enPassant !== null && capSq === enPassant) {
            moves.push({ from: sq, to: capSq, piece: 'p', captured: 'p', isEnPassant: true });
          }
        }
      }
    } else if (piece.type === 'n') {
      for (let i = 0; i < KNIGHT_DIRS.length; i++) {
        const nr = r + KNIGHT_DIRS[i][0];
        const nc = c + KNIGHT_DIRS[i][1];
        if (nr < 0 || nr > 7 || nc < 0 || nc > 7) continue;
        const to = (nr << 3) | nc;
        const target = board[to];
        if (!target) {
          if (!capturesOnly) moves.push({ from: sq, to, piece: 'n' });
        } else if (target.color === enemy) {
          moves.push({ from: sq, to, piece: 'n', captured: target.type });
        }
      }
    } else if (piece.type === 'b' || piece.type === 'r' || piece.type === 'q') {
      const dirs =
        piece.type === 'b' ? BISHOP_DIRS : piece.type === 'r' ? ROOK_DIRS : [...BISHOP_DIRS, ...ROOK_DIRS];
      for (let i = 0; i < dirs.length; i++) {
        let nr = r + dirs[i][0];
        let nc = c + dirs[i][1];
        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const to = (nr << 3) | nc;
          const target = board[to];
          if (!target) {
            if (!capturesOnly) moves.push({ from: sq, to, piece: piece.type });
          } else {
            if (target.color === enemy) {
              moves.push({ from: sq, to, piece: piece.type, captured: target.type });
            }
            break;
          }
          nr += dirs[i][0];
          nc += dirs[i][1];
        }
      }
    } else if (piece.type === 'k') {
      for (let i = 0; i < KING_DIRS.length; i++) {
        const nr = r + KING_DIRS[i][0];
        const nc = c + KING_DIRS[i][1];
        if (nr < 0 || nr > 7 || nc < 0 || nc > 7) continue;
        const to = (nr << 3) | nc;
        const target = board[to];
        if (!target) {
          if (!capturesOnly) moves.push({ from: sq, to, piece: 'k' });
        } else if (target.color === enemy) {
          moves.push({ from: sq, to, piece: 'k', captured: target.type });
        }
      }

      // Castling
      if (!capturesOnly) {
        if (turn === 'w' && sq === 60) {
          if (
            castling.wK &&
            !board[61] &&
            !board[62] &&
            board[63]?.type === 'r' &&
            board[63]?.color === 'w' &&
            !isSquareAttacked(board, 60, 'b') &&
            !isSquareAttacked(board, 61, 'b') &&
            !isSquareAttacked(board, 62, 'b')
          ) {
            moves.push({ from: 60, to: 62, piece: 'k', isCastle: 'K' });
          }
          if (
            castling.wQ &&
            !board[59] &&
            !board[58] &&
            !board[57] &&
            board[56]?.type === 'r' &&
            board[56]?.color === 'w' &&
            !isSquareAttacked(board, 60, 'b') &&
            !isSquareAttacked(board, 59, 'b') &&
            !isSquareAttacked(board, 58, 'b')
          ) {
            moves.push({ from: 60, to: 58, piece: 'k', isCastle: 'Q' });
          }
        } else if (turn === 'b' && sq === 4) {
          if (
            castling.bK &&
            !board[5] &&
            !board[6] &&
            board[7]?.type === 'r' &&
            board[7]?.color === 'b' &&
            !isSquareAttacked(board, 4, 'w') &&
            !isSquareAttacked(board, 5, 'w') &&
            !isSquareAttacked(board, 6, 'w')
          ) {
            moves.push({ from: 4, to: 6, piece: 'k', isCastle: 'K' });
          }
          if (
            castling.bQ &&
            !board[3] &&
            !board[2] &&
            !board[1] &&
            board[0]?.type === 'r' &&
            board[0]?.color === 'b' &&
            !isSquareAttacked(board, 4, 'w') &&
            !isSquareAttacked(board, 3, 'w') &&
            !isSquareAttacked(board, 2, 'w')
          ) {
            moves.push({ from: 4, to: 2, piece: 'k', isCastle: 'Q' });
          }
        }
      }
    }
  }

  return moves;
}

export function applyMoveFast(state: ChessState, move: ChessMove): ChessState {
  const board = state.board.slice();
  const movingColor = state.turn;
  const castling = { ...state.castling };

  const piece = board[move.from]!;
  board[move.from] = null;

  if (move.isEnPassant) {
    const capSq = ((move.from >> 3) << 3) | (move.to & 7);
    board[capSq] = null;
  }

  if (move.isCastle) {
    if (movingColor === 'w') {
      if (move.isCastle === 'K') {
        board[61] = board[63];
        board[63] = null;
      } else {
        board[59] = board[56];
        board[56] = null;
      }
    } else {
      if (move.isCastle === 'K') {
        board[5] = board[7];
        board[7] = null;
      } else {
        board[3] = board[0];
        board[0] = null;
      }
    }
  }

  board[move.to] = move.promotion ? { type: move.promotion, color: movingColor } : piece;

  // Update castling rights
  if (move.from === 60 || move.to === 60) {
    castling.wK = false;
    castling.wQ = false;
  }
  if (move.from === 4 || move.to === 4) {
    castling.bK = false;
    castling.bQ = false;
  }
  if (move.from === 63 || move.to === 63) castling.wK = false;
  if (move.from === 56 || move.to === 56) castling.wQ = false;
  if (move.from === 7 || move.to === 7) castling.bK = false;
  if (move.from === 0 || move.to === 0) castling.bQ = false;

  // Update en passant square
  let enPassant: number | null = null;
  if (move.piece === 'p' && Math.abs((move.to >> 3) - (move.from >> 3)) === 2) {
    enPassant = (move.from + move.to) >> 1;
  }

  const halfMoveClock = move.piece === 'p' || move.captured ? 0 : state.halfMoveClock + 1;
  const fullMoveNumber = movingColor === 'b' ? state.fullMoveNumber + 1 : state.fullMoveNumber;

  return {
    board,
    turn: opposite(movingColor),
    castling,
    enPassant,
    halfMoveClock,
    fullMoveNumber,
    history: state.history,
  };
}

export function getLegalMoves(state: ChessState, capturesOnly = false): ChessMove[] {
  const pseudo = generatePseudoLegalMoves(state, capturesOnly);
  const legal: ChessMove[] = [];
  const enemy = opposite(state.turn);

  for (let i = 0; i < pseudo.length; i++) {
    const next = applyMoveFast(state, pseudo[i]);
    const kSq = findKing(next.board, state.turn);
    if (kSq !== -1 && !isSquareAttacked(next.board, kSq, enemy)) {
      legal.push(pseudo[i]);
    }
  }
  return legal;
}

export function getLegalMovesFrom(state: ChessState, fromSq: number): ChessMove[] {
  return getLegalMoves(state).filter((m) => m.from === fromSq);
}

function isInsufficientMaterial(board: (Piece | null)[]): boolean {
  const minors: { type: PieceType; color: Color; sq: number }[] = [];
  for (let i = 0; i < 64; i++) {
    const p = board[i];
    if (!p || p.type === 'k') continue;
    if (p.type === 'p' || p.type === 'r' || p.type === 'q') return false;
    minors.push({ type: p.type, color: p.color, sq: i });
  }
  if (minors.length <= 1) return true; // K vs K, K+B vs K, K+N vs K
  if (minors.length === 2 && minors[0].type === 'b' && minors[1].type === 'b') {
    const c0 = ((minors[0].sq >> 3) + (minors[0].sq & 7)) & 1;
    const c1 = ((minors[1].sq >> 3) + (minors[1].sq & 7)) & 1;
    if (c0 === c1) return true; // Bishops on same square color
  }
  return false;
}

export function getGameStatus(state: ChessState): GameStatus {
  const kingSq = findKing(state.board, state.turn);
  const inCheck = kingSq !== -1 && isSquareAttacked(state.board, kingSq, opposite(state.turn));
  const legal = getLegalMoves(state);

  if (legal.length === 0) {
    if (inCheck) {
      return { kind: 'checkmate', winner: opposite(state.turn), inCheck: true, kingSq };
    }
    return { kind: 'stalemate', inCheck: false, kingSq };
  }
  if (state.halfMoveClock >= 100) {
    return { kind: 'draw-50', inCheck, kingSq };
  }
  if (isInsufficientMaterial(state.board)) {
    return { kind: 'draw-insufficient', inCheck, kingSq };
  }
  return { kind: inCheck ? 'check' : 'playing', inCheck, kingSq };
}

function formatSan(before: ChessState, move: ChessMove, after: ChessState): string {
  let san = '';
  if (move.isCastle === 'K') {
    san = 'O-O';
  } else if (move.isCastle === 'Q') {
    san = 'O-O-O';
  } else {
    if (move.piece === 'p') {
      if (move.captured) san += FILES[move.from & 7] + 'x';
      san += sqToAlg(move.to);
      if (move.promotion) san += '=' + move.promotion.toUpperCase();
    } else {
      san += move.piece.toUpperCase();
      // Disambiguation if another identical piece can legally reach move.to
      const peers = getLegalMoves(before).filter(
        (m) => m.piece === move.piece && m.to === move.to && m.from !== move.from
      );
      if (peers.length > 0) {
        const sameFile = peers.some((m) => (m.from & 7) === (move.from & 7));
        const sameRank = peers.some((m) => (m.from >> 3) === (move.from >> 3));
        if (!sameFile) san += FILES[move.from & 7];
        else if (!sameRank) san += RANKS[move.from >> 3];
        else san += sqToAlg(move.from);
      }
      if (move.captured) san += 'x';
      san += sqToAlg(move.to);
    }
  }

  const statusAfter = getGameStatus(after);
  if (statusAfter.kind === 'checkmate') san += '#';
  else if (statusAfter.inCheck) san += '+';
  return san;
}

export function makeMove(state: ChessState, move: ChessMove): ChessState {
  const after = applyMoveFast(state, move);
  const san = formatSan(state, move, after);
  after.history = [
    ...state.history,
    {
      move,
      san,
      color: state.turn,
      moveNumber: state.fullMoveNumber,
    },
  ];
  return after;
}

export function getCapturedAndMaterial(board: (Piece | null)[]): {
  capturedByWhite: PieceType[];
  capturedByBlack: PieceType[];
  whiteAdvantage: number;
} {
  const initial: Record<PieceType, number> = { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 };
  const curW: Record<PieceType, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };
  const curB: Record<PieceType, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };

  for (let i = 0; i < 64; i++) {
    const p = board[i];
    if (!p) continue;
    if (p.color === 'w') curW[p.type]++;
    else curB[p.type]++;
  }

  const order: PieceType[] = ['q', 'r', 'b', 'n', 'p'];
  const vals: Record<PieceType, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  const capturedByWhite: PieceType[] = [];
  const capturedByBlack: PieceType[] = [];

  for (const t of order) {
    const missingB = Math.max(0, initial[t] - curB[t]);
    const missingW = Math.max(0, initial[t] - curW[t]);
    for (let k = 0; k < missingB; k++) capturedByWhite.push(t);
    for (let k = 0; k < missingW; k++) capturedByBlack.push(t);
  }

  let wMat = 0;
  let bMat = 0;
  for (const t of order) {
    wMat += curW[t] * vals[t];
    bMat += curB[t] * vals[t];
  }

  return { capturedByWhite, capturedByBlack, whiteAdvantage: wMat - bMat };
}

// =============================================================================
// LOCAL AI ENGINE (Minimax + Alpha-Beta Pruning + Piece-Square Tables + Quiescence)
// =============================================================================

const PIECE_VALUES: Record<PieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square Tables from White's perspective (a8 = index 0 ... h1 = index 63)
const PST_P = [
  0, 0, 0, 0, 0, 0, 0, 0,
  50, 50, 50, 50, 50, 50, 50, 50,
  12, 12, 20, 32, 32, 20, 12, 12,
  5, 5, 10, 27, 27, 10, 5, 5,
  0, 0, 0, 24, 24, 0, 0, 0,
  5, -5, -10, 0, 0, -10, -5, 5,
  5, 10, 10, -20, -20, 10, 10, 5,
  0, 0, 0, 0, 0, 0, 0, 0,
];

const PST_N = [
  -50, -40, -30, -30, -30, -30, -40, -50,
  -40, -20, 0, 0, 0, 0, -20, -40,
  -30, 0, 12, 16, 16, 12, 0, -30,
  -30, 5, 16, 22, 22, 16, 5, -30,
  -30, 0, 16, 22, 22, 16, 0, -30,
  -30, 5, 12, 16, 16, 12, 5, -30,
  -40, -20, 0, 5, 5, 0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50,
];

const PST_B = [
  -20, -10, -10, -10, -10, -10, -10, -20,
  -10, 0, 0, 0, 0, 0, 0, -10,
  -10, 0, 6, 10, 10, 6, 0, -10,
  -10, 6, 6, 12, 12, 6, 6, -10,
  -10, 0, 12, 12, 12, 12, 0, -10,
  -10, 10, 10, 10, 10, 10, 10, -10,
  -10, 6, 0, 0, 0, 0, 6, -10,
  -20, -10, -10, -10, -10, -10, -10, -20,
];

const PST_R = [
  0, 0, 0, 0, 0, 0, 0, 0,
  6, 12, 12, 12, 12, 12, 12, 6,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  0, 0, 2, 8, 8, 2, 0, 0,
];

const PST_Q = [
  -20, -10, -10, -5, -5, -10, -10, -20,
  -10, 0, 0, 0, 0, 0, 0, -10,
  -10, 0, 6, 6, 6, 6, 0, -10,
  -5, 0, 6, 6, 6, 6, 0, -5,
  0, 0, 6, 6, 6, 6, 0, -5,
  -10, 5, 6, 6, 6, 6, 0, -10,
  -10, 0, 5, 0, 0, 0, 0, -10,
  -20, -10, -10, -5, -5, -10, -10, -20,
];

const PST_K_MID = [
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -20, -30, -30, -40, -40, -30, -30, -20,
  -10, -20, -20, -20, -20, -20, -20, -10,
  20, 20, 0, 0, 0, 0, 20, 20,
  20, 30, 10, 0, 0, 10, 30, 20,
];

const PST_K_END = [
  -50, -30, -20, -10, -10, -20, -30, -50,
  -30, -10, 10, 20, 20, 10, -10, -30,
  -20, 10, 25, 35, 35, 25, 10, -20,
  -10, 20, 35, 45, 45, 35, 20, -10,
  -10, 20, 35, 45, 45, 35, 20, -10,
  -20, 10, 25, 35, 35, 25, 10, -20,
  -30, -10, 10, 20, 20, 10, -10, -30,
  -50, -30, -20, -10, -10, -20, -30, -50,
];

function mirrorSq(sq: number): number {
  return ((7 - (sq >> 3)) << 3) | (sq & 7);
}

export function evaluateBoard(board: (Piece | null)[]): number {
  let score = 0;
  let queens = 0;
  let wBishops = 0;
  let bBishops = 0;

  for (let i = 0; i < 64; i++) {
    const p = board[i];
    if (!p) continue;
    if (p.type === 'q') queens++;
    if (p.type === 'b') {
      if (p.color === 'w') wBishops++;
      else bBishops++;
    }
  }

  const endgame = queens === 0;

  for (let sq = 0; sq < 64; sq++) {
    const p = board[sq];
    if (!p) continue;
    const idx = p.color === 'w' ? sq : mirrorSq(sq);
    let val = PIECE_VALUES[p.type];

    switch (p.type) {
      case 'p':
        val += PST_P[idx];
        break;
      case 'n':
        val += PST_N[idx];
        break;
      case 'b':
        val += PST_B[idx];
        break;
      case 'r':
        val += PST_R[idx];
        break;
      case 'q':
        val += PST_Q[idx];
        break;
      case 'k':
        val += endgame ? PST_K_END[idx] : PST_K_MID[idx];
        break;
    }

    score += p.color === 'w' ? val : -val;
  }

  if (wBishops >= 2) score += 30;
  if (bBishops >= 2) score -= 30;

  return score;
}

function scoreMoveOrdering(m: ChessMove): number {
  let s = 0;
  if (m.captured) {
    s += 10 * PIECE_VALUES[m.captured] - PIECE_VALUES[m.piece] + 1000;
  }
  if (m.promotion) {
    s += PIECE_VALUES[m.promotion] + 900;
  }
  if (m.isCastle) s += 120;
  return s;
}

export function findBestMove(state: ChessState, difficulty: AiDifficulty): AiSearchResult {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  let nodes = 0;

  const legal = getLegalMoves(state);
  if (legal.length === 0) {
    return { move: null, scoreCp: evaluateBoard(state.board), nodes: 0, elapsedMs: 0 };
  }

  const isWhite = state.turn === 'w';
  const maxDepth = difficulty === 'scout' ? 1 : difficulty === 'tactical' ? 2 : 3;
  const useQuiescence = difficulty !== 'scout';

  function quiescence(s: ChessState, alpha: number, beta: number, qDepth: number): number {
    nodes++;
    const standPat = s.turn === 'w' ? evaluateBoard(s.board) : -evaluateBoard(s.board);
    if (qDepth <= 0) return standPat;
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;

    const caps = getLegalMoves(s, true);
    caps.sort((a, b) => scoreMoveOrdering(b) - scoreMoveOrdering(a));

    for (let i = 0; i < caps.length; i++) {
      const next = applyMoveFast(s, caps[i]);
      const score = -quiescence(next, -beta, -alpha, qDepth - 1);
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  }

  function negamax(s: ChessState, depth: number, alpha: number, beta: number, ply: number): number {
    nodes++;
    const moves = getLegalMoves(s);
    if (moves.length === 0) {
      const kSq = findKing(s.board, s.turn);
      const inCheck = kSq !== -1 && isSquareAttacked(s.board, kSq, opposite(s.turn));
      return inCheck ? -100000 + ply : 0; // Checkmate vs Stalemate
    }
    if (s.halfMoveClock >= 100 || isInsufficientMaterial(s.board)) {
      return 0;
    }
    if (depth === 0) {
      return useQuiescence
        ? quiescence(s, alpha, beta, difficulty === 'apex' ? 4 : 2)
        : s.turn === 'w'
        ? evaluateBoard(s.board)
        : -evaluateBoard(s.board);
    }

    moves.sort((a, b) => scoreMoveOrdering(b) - scoreMoveOrdering(a));

    let best = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      const next = applyMoveFast(s, moves[i]);
      const val = -negamax(next, depth - 1, -beta, -alpha, ply + 1);
      if (val > best) best = val;
      if (val > alpha) alpha = val;
      if (alpha >= beta) break;
    }
    return best;
  }

  legal.sort((a, b) => scoreMoveOrdering(b) - scoreMoveOrdering(a));

  const scored: { move: ChessMove; score: number }[] = [];
  let alpha = -Infinity;
  const beta = Infinity;

  for (let i = 0; i < legal.length; i++) {
    const next = applyMoveFast(state, legal[i]);
    const score = -negamax(next, maxDepth - 1, -beta, -alpha, 1);
    scored.push({ move: legal[i], score });
    if (difficulty !== 'scout' && score > alpha) {
      alpha = score;
    }
  }

  scored.sort((a, b) => b.score - a.score);

  let chosen = scored[0];
  if (difficulty === 'scout') {
    // Allow natural human-like variety among top non-blunder moves
    const topBand = scored.filter((s) => s.score >= scored[0].score - 110).slice(0, 4);
    chosen = topBand[Math.floor(Math.random() * topBand.length)] || scored[0];
  } else if (difficulty === 'tactical') {
    const ties = scored.filter((s) => s.score >= scored[0].score - 18).slice(0, 2);
    chosen = ties[Math.floor(Math.random() * ties.length)] || scored[0];
  }

  const elapsedMs = Math.round((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0);
  const scoreCp = isWhite ? chosen.score : -chosen.score;

  return {
    move: chosen.move,
    scoreCp,
    nodes,
    elapsedMs,
  };
}
