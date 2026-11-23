export interface DecryptedArchitectVault {
  vaultTitle: string;
  monogram: string;
  architect: string;
  handle: string;
  role: string;
  email: string;
  epigraph: string;
  revelation: string;
  magicNote: string;
}

export interface VaultTrialSpec {
  id: number;
  pillar: string;
  title: string;
  prompt: string;
  hash: string;
}

export interface TrialSubmitResult {
  status: 'ritual_required' | 'unsupported' | 'wrong_answer' | 'advanced' | 'unlocked';
  clearedCount?: number;
  nextTrial?: VaultTrialSpec;
  payload?: DecryptedArchitectVault;
  proofCode?: string;
}

export const TOTAL_VAULT_TRIALS = 21;

export const VAULT_EPIGRAPH = 'A game of intelligence and engineered possibility.';

// Stage 2 cipher seed attached invisibly to the Living Owl Crest SVG [data-vault-seed]
export const OWL_VAULT_SEED =
  '4B6B6F4D526B55455354454154415660556C3F6052377F4554514D524E43427E4E42514E5144455455515548555445575144436E604D566063407F365E5F5E60486C3251526E4542536C42604C527475654F4D37567E606054527F434E42324152423F60536C514E514446724C52515453374A605452423E4A6E7F4A555155485453377F4B4149495551555350514A3E4A4460605F534E744A5470704B434E744A44707F4B434D654E414D4155414D574E41554356516F414E42324D4E41495456527F4A54514660534163574E42734354527F434E43774A5651515254514E604B6C5541526C414153424A604A6E45415537415252703A3A';

// One-way SHA-256 digests — zero plaintext answers, keys, or ritual sequences exist anywhere in client JS
const RITUAL_SHA256 = 'ce22cb0652408e3debca1a8b36cf35d0bcd425cafaf73a9d5afc09ec916ef2d5';
const ARMED_TOKEN = '2d29241860e8b33bccfc691bced1b4796af018177ded2db315f25e7e66d468c6';
const MASTER_CHAIN_SHA256 = 'ade25614541e62d5bc5bba95bda58ba733d10e3102e8276160d0b7ca0342392b';

// Stream-encrypted English-only Vault payload — decryptable ONLY with all 21 chained answers
const ENCRYPTED_VAULT_HEX =
  '52d2697191ef07bf3d3342a151c9ca1fb7277bde9b0c7fe49c33d0d5bc177c57cb8fe9e2cd3ed915b98e470de3c8e01211fb7c3944707b494b0d3d89e55dd7b1aa674433066e834144caba3c67634f1436422804237132665f6bad7ce28855e0b310a949fca76ad4e8bf8293097863836a2cebb2fca4b9816106ad20ba7d57e6191af9a6e854f7ca31221ad7a57d65cd12e8a874fbeb47404c67713e229f0d8e04dd6b39546dd87edcf8d0de768cca7de7bc1304233ef6bd2d388c39f21475e1184fed71bd92f5b3a7741f280796fdcafbca8f413da6b2e38805cbc9eb90d8d8ea2f40154091fb1cd4eca9add3f1f79d4dd9a14996b7c9986e99b68c73b08c15a3743756065b7ba70d28004637ec6a6ea0ec6b828bee76c76a4fefcf6b615ac312d49373262e88c4541ad897a8bc3a4f9f2f8694380b45ccf2217db1727b577745b80e79868c338d3a572b6e753f8a8a0c8874dccaefcf53de929c846086d45df8e737deb35f317313f013f761c551e5c8bcd249f443c8aa68c1310ee6bb9cca852d18ea2ea408219b5d6871e7bb93a083eb026f7b7f1f13be54004731d4a10173bd4a97d0da5a2fe085a86ec273ff52ca88e5d159942b13950294a13869d993463fcd549b6ce5b6b28e04379b3808deee5213d543';

export const VAULT_TRIALS: VaultTrialSpec[] = [
  {
    id: 1,
    pillar: 'PILLAR I · SYSTEMS',
    title: 'The Sovereign Constant',
    prompt: 'Three Pillars govern seven Nodes. Multiply them to speak the Sovereign Constant.',
    hash: '88172d7adc579d1766a572c4a4cc019a5c9c13856fed31b82596138304cc293c',
  },
  {
    id: 2,
    pillar: 'PILLAR I · SYSTEMS',
    title: 'Binary Awakening',
    prompt: 'Decode the 8-bit ASCII binary stream: 01001011 01000001 01000001 01001110',
    hash: '9effd3dfd64d283ce285a3ce32c979fb9685a5eb8860459ee04ec92660a6c342',
  },
  {
    id: 3,
    pillar: 'PILLAR I · SYSTEMS',
    title: 'Bitwise Mirror',
    prompt: 'Compute (0x5A XOR 0x3F) in uppercase hexadecimal (without 0x prefix).',
    hash: 'bfa1d113ea5f6e11e4001bbcd5447154a90ce0a0f498d4bc2b9e9693ecdb4f7b',
  },
  {
    id: 4,
    pillar: 'PILLAR I · SYSTEMS',
    title: 'Base64 Telemetry',
    prompt: 'Decode Base64: TUFUUklY',
    hash: '1275a70a4c2fb1e28da2fce73775ce9d14086e44753245e8ed09639587f9a5a7',
  },
  {
    id: 5,
    pillar: 'PILLAR I · SYSTEMS',
    title: 'Caesar Shift (-7)',
    prompt: 'Shift every letter backward by 7 positions (A..Z): ZLUAPULS',
    hash: '2b1adbec1f227ea7b766714303aa5a0f3743e8d9c84b63b8798f10caab64a15a',
  },
  {
    id: 6,
    pillar: 'PILLAR I · SYSTEMS',
    title: 'Modular Clock',
    prompt: 'Compute (2^10) mod 97. Enter the exact integer.',
    hash: '225f7c5ad94af17f5e50bf3572b6c743e92e4ce73795564d15fe45af7cf8bcc5',
  },
  {
    id: 7,
    pillar: 'PILLAR I · SYSTEMS',
    title: 'Inverted Hex Stream',
    prompt: 'Convert Hex to ASCII, then reverse the word: 45524F43',
    hash: '2bc4f53c8958e22f43967b423b1357d6e1256a5c0ff3be5c87e12c67d4e85037',
  },
  {
    id: 8,
    pillar: 'PILLAR II · INTEL',
    title: 'Fibonacci Gate',
    prompt: 'In the sequence 1, 1, 2, 3, 5, 8, 13, 21, 34, 55... enter the 12th term.',
    hash: 'c7a1e568a5746a4bde4ac4d48691fb54a25f3609f33fc4067b052daaa8dd4c79',
  },
  {
    id: 9,
    pillar: 'PILLAR II · INTEL',
    title: 'Prime Nexus',
    prompt: 'Multiply the 7th prime number by the 3rd prime number. Enter the integer.',
    hash: 'fca2d6ef264df66672037cecad9cf331d7ea3da43288d04e1e84fcd2cd3d8fa6',
  },
  {
    id: 10,
    pillar: 'PILLAR II · INTEL',
    title: 'Boolean Circuit',
    prompt: 'Given A=1, B=0, C=1: output the 2-bit string [((A AND NOT B) XOR (B OR C))][A AND C].',
    hash: 'd16aec9d102a5449ae865f9a7d2cd9d0f54787e1bc6380a7785682014a962c16',
  },
  {
    id: 11,
    pillar: 'PILLAR II · INTEL',
    title: 'Octal Signal',
    prompt: 'Decode the base-8 (Octal) ASCII sequence: 117 127 114',
    hash: 'aee0345d46f03d5d20e1b49e4f589df9ac8e69571c9016c3b128b0499fe68660',
  },
  {
    id: 12,
    pillar: 'PILLAR II · INTEL',
    title: 'Atbash Reflection',
    prompt: 'Apply the Atbash mirror cipher (A<->Z, B<->Y...): XILDM',
    hash: '10dc2b659f705ed5da9e253a4a95c80b95cd2c3ebf0a3370aa74713c600dfcdb',
  },
  {
    id: 13,
    pillar: 'PILLAR II · INTEL',
    title: 'Complexity Oracle',
    prompt: 'Exact worst-case comparisons for binary search over 1,048,576 sorted elements (log2(2^20)).',
    hash: '9b18835655c6a7e90a07b015d6f302bb7cab875f1c0f33e922f528925bf790a2',
  },
  {
    id: 14,
    pillar: 'PILLAR II · INTEL',
    title: 'Matrix Determinant',
    prompt: 'Compute the determinant det([[7, 3], [5, 4]]) of this 2x2 matrix.',
    hash: '7c4d0df347ebc09310aeeb6f4db9c8b1fc52753b3efd2cf16f26c6122fab7c0e',
  },
  {
    id: 15,
    pillar: 'PILLAR III · AI CORE',
    title: 'ROT13 Layer',
    prompt: 'Decode ROT13: NEPUVGRPG',
    hash: '890baec5c4c929a5c83c273aa172c2d361d57e203c8ba9c3a91297c3f50a3832',
  },
  {
    id: 16,
    pillar: 'PILLAR III · AI CORE',
    title: 'Vigenere Seal',
    prompt: 'Decrypt Vigenere ciphertext "FVRVO" using repeating key "KVX".',
    hash: '66ac4211727d043c28a81b8a262a887dd53a42547eb26b0b43c11b344361f3ac',
  },
  {
    id: 17,
    pillar: 'PILLAR III · AI CORE',
    title: 'Double-Layer XOR(21)',
    prompt: 'Decode Hex, then XOR every byte with decimal 21: 5A475C525C5B',
    hash: '0d8cde579649ad0c06b79a5d5bdbdd9459c5d6d425cea78714f1cc4db7e56826',
  },
  {
    id: 18,
    pillar: 'PILLAR III · AI CORE',
    title: 'Complete 7-Node Graph',
    prompt: 'A complete undirected graph K_7 connects every pair of the 7 Chest Nodes. How many edges exist?',
    hash: '2a874181f9755f6b39f2ae73468dec9ffd71a00b91bfe20fb3dc9a79dc47ab9e',
  },
  {
    id: 19,
    pillar: 'PILLAR III · AI CORE',
    title: 'ASCII Checksum',
    prompt: 'Sum the uppercase ASCII values of every letter in "KRONVEX". Enter the integer.',
    hash: 'f15bea09c303a10eabb5c157cacf50c0c8fb7012b3a789d3f0c45d8454989e7a',
  },
  {
    id: 20,
    pillar: 'PILLAR III · AI CORE',
    title: 'Hidden Surface',
    prompt: 'Take the first letter of each word: "Keeps Realizing Optimal Networks, Visionary Engineering X-factor"',
    hash: '23704fa9d9f246b526e1b8aaf4e39ffe0d838424cafb826803274e8ee8219a56',
  },
  {
    id: 21,
    pillar: 'PILLAR III · THE PRESTIGE',
    title: 'The Simplest Secret',
    prompt:
      '"Most often, the most thrilling magic tricks hide the simplest secret." After 20 layers of math, binary, and ciphers, the final lock needs no algorithm — enter the single 4-letter word you say to unlock any door.',
    hash: 'b982c517b50d55f283bc85663266cb6face594f3af55b33e8026beb780d6329d',
  },
];

const RESONANCE_KEY = 'kvx_resonance';
const CHAIN_KEY = 'kvx_trials_21';

async function sha256Bytes(input: string): Promise<Uint8Array> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(digest);
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function sha256Hex(input: string): Promise<string> {
  return bytesToHex(await sha256Bytes(input));
}

function readStoredAnswers(): string[] {
  try {
    const raw = sessionStorage.getItem(CHAIN_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string').slice(0, TOTAL_VAULT_TRIALS) : [];
  } catch {
    return [];
  }
}

function writeStoredAnswers(answers: string[]): void {
  try {
    sessionStorage.setItem(CHAIN_KEY, JSON.stringify(answers));
  } catch {
    // Ignore storage restrictions
  }
}

export function getVaultProgress(): { cleared: number; currentTrial: VaultTrialSpec | null } {
  const answers = readStoredAnswers();
  const cleared = Math.min(answers.length, TOTAL_VAULT_TRIALS);
  return {
    cleared,
    currentTrial: cleared < TOTAL_VAULT_TRIALS ? VAULT_TRIALS[cleared] : null,
  };
}

export function resetVaultProgress(): void {
  try {
    sessionStorage.removeItem(CHAIN_KEY);
  } catch {
    // Ignore storage restrictions
  }
}

export function isRitualArmed(): boolean {
  try {
    return sessionStorage.getItem(RESONANCE_KEY) === ARMED_TOKEN;
  } catch {
    return false;
  }
}

export async function verifyOwlRitual(lastSevenPillars: number[]): Promise<boolean> {
  if (lastSevenPillars.length < 7 || !crypto?.subtle) return false;
  const candidate = lastSevenPillars.slice(-7).join('-');
  const hash = await sha256Hex(candidate);
  if (hash === RITUAL_SHA256) {
    const token = await sha256Hex(`${hash}:ARMED`);
    if (token === ARMED_TOKEN) {
      try {
        sessionStorage.setItem(RESONANCE_KEY, token);
      } catch {
        // Ignore storage restrictions
      }
      return true;
    }
  }
  return false;
}

async function decryptVaultFromChain(answers: string[]): Promise<{ payload: DecryptedArchitectVault; proofCode: string } | null> {
  if (answers.length !== TOTAL_VAULT_TRIALS) return null;
  const masterChain = answers.join('|');
  const chainHash = await sha256Hex(masterChain);
  if (chainHash !== MASTER_CHAIN_SHA256) return null;

  const cipherBytes = hexToBytes(ENCRYPTED_VAULT_HEX);
  const plainBytes = new Uint8Array(cipherBytes.length);

  let offset = 0;
  let block = 0;
  while (offset < cipherBytes.length) {
    const mask = await sha256Bytes(`${masterChain}:KVX21:${block}`);
    const take = Math.min(mask.length, cipherBytes.length - offset);
    for (let i = 0; i < take; i++) {
      plainBytes[offset + i] = cipherBytes[offset + i] ^ mask[i];
    }
    offset += take;
    block++;
  }

  const decodedText = new TextDecoder().decode(plainBytes);
  const payload = JSON.parse(decodedText) as DecryptedArchitectVault;
  const proofHash = await sha256Hex(`${chainHash}:${Date.now().toString(36).slice(0, 4)}`);
  const proofCode = `KVX-21-${proofHash.slice(0, 12).toUpperCase()}`;
  return { payload, proofCode };
}

export async function reopenUnlockedVault(): Promise<{ payload: DecryptedArchitectVault; proofCode: string } | null> {
  if (!crypto?.subtle || !isRitualArmed()) return null;
  const answers = readStoredAnswers();
  if (answers.length !== TOTAL_VAULT_TRIALS) return null;
  return decryptVaultFromChain(answers);
}

export async function submitVaultTrial(rawAnswer: string): Promise<TrialSubmitResult> {
  if (!crypto?.subtle) return { status: 'unsupported' };
  if (!isRitualArmed()) return { status: 'ritual_required' };

  const answers = readStoredAnswers();
  if (answers.length >= TOTAL_VAULT_TRIALS) {
    const unlocked = await decryptVaultFromChain(answers);
    if (unlocked) {
      return {
        status: 'unlocked',
        clearedCount: TOTAL_VAULT_TRIALS,
        payload: unlocked.payload,
        proofCode: unlocked.proofCode,
      };
    }
    resetVaultProgress();
  }

  const freshAnswers = readStoredAnswers();
  const idx = freshAnswers.length;
  const trial = VAULT_TRIALS[idx];
  const normalized = rawAnswer.trim().toUpperCase();
  const candidateHash = await sha256Hex(`KVX21:T${trial.id}:${normalized}`);

  if (candidateHash !== trial.hash) {
    return {
      status: 'wrong_answer',
      clearedCount: idx,
      nextTrial: trial,
    };
  }

  const updated = [...freshAnswers, normalized];
  writeStoredAnswers(updated);

  if (updated.length < TOTAL_VAULT_TRIALS) {
    return {
      status: 'advanced',
      clearedCount: updated.length,
      nextTrial: VAULT_TRIALS[updated.length],
    };
  }

  const unlocked = await decryptVaultFromChain(updated);
  if (!unlocked) {
    resetVaultProgress();
    return { status: 'wrong_answer', clearedCount: 0, nextTrial: VAULT_TRIALS[0] };
  }

  return {
    status: 'unlocked',
    clearedCount: TOTAL_VAULT_TRIALS,
    payload: unlocked.payload,
    proofCode: unlocked.proofCode,
  };
}

export async function unlockVaultWithChain(rawChain: string): Promise<TrialSubmitResult> {
  if (!crypto?.subtle) return { status: 'unsupported' };
  if (!isRitualArmed()) return { status: 'ritual_required' };

  const parts = rawChain
    .split('|')
    .map((p) => p.trim().toUpperCase())
    .filter((p) => p.length > 0);

  if (parts.length !== TOTAL_VAULT_TRIALS) {
    return { status: 'wrong_answer', clearedCount: readStoredAnswers().length };
  }

  for (let i = 0; i < TOTAL_VAULT_TRIALS; i++) {
    const h = await sha256Hex(`KVX21:T${VAULT_TRIALS[i].id}:${parts[i]}`);
    if (h !== VAULT_TRIALS[i].hash) {
      return { status: 'wrong_answer', clearedCount: i, nextTrial: VAULT_TRIALS[i] };
    }
  }

  const unlocked = await decryptVaultFromChain(parts);
  if (!unlocked) return { status: 'wrong_answer', clearedCount: 0 };

  writeStoredAnswers(parts);
  return {
    status: 'unlocked',
    clearedCount: TOTAL_VAULT_TRIALS,
    payload: unlocked.payload,
    proofCode: unlocked.proofCode,
  };
}

/**
 * Generates a self-contained, zero-dependency, zero-cheat Node.js CLI runner
 * (`kronvex-matrix-cli.mjs`) containing ONLY salted SHA-256 hashes and the
 * stream-encrypted Vault payload.
 */
export function buildStandaloneCliScript(): string {
  const trialsJson = JSON.stringify(VAULT_TRIALS, null, 2);
  return `#!/usr/bin/env node
/**
 * KRONVEX // 21-TRIAL MATRIX CLI (Standalone Offline Edition)
 * "${VAULT_EPIGRAPH}"
 *
 * Requirements: Node.js 18+ (zero external packages)
 * Run:          node kronvex-matrix-cli.mjs
 * Zero-Cheat:   Contains only salted SHA-256 hashes & stream-encrypted payload.
 */
import crypto from 'node:crypto';
import readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';

const MASTER_CHAIN_SHA256 = '${MASTER_CHAIN_SHA256}';
const ENCRYPTED_VAULT_HEX = '${ENCRYPTED_VAULT_HEX}';
const TRIALS = ${trialsJson};

function sha256Hex(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

function decryptVault(masterChain) {
  const cipher = Buffer.from(ENCRYPTED_VAULT_HEX, 'hex');
  const plain = Buffer.alloc(cipher.length);
  let offset = 0;
  let block = 0;
  while (offset < cipher.length) {
    const mask = crypto.createHash('sha256').update(\`\${masterChain}:KVX21:\${block}\`, 'utf8').digest();
    const take = Math.min(mask.length, cipher.length - offset);
    for (let i = 0; i < take; i++) plain[offset + i] = cipher[offset + i] ^ mask[i];
    offset += take;
    block++;
  }
  return JSON.parse(plain.toString('utf8'));
}

function createLineReader() {
  const rl = readline.createInterface({ input, output });
  const queue = [];
  const waiters = [];
  let closed = false;

  rl.on('line', (line) => {
    if (waiters.length > 0) waiters.shift()(line);
    else queue.push(line);
  });
  rl.on('close', () => {
    closed = true;
    while (waiters.length > 0) waiters.shift()(null);
  });

  return {
    ask(prompt) {
      output.write(prompt);
      if (queue.length > 0) return Promise.resolve(queue.shift());
      if (closed) return Promise.resolve(null);
      return new Promise((resolve) => waiters.push(resolve));
    },
    close() {
      rl.close();
    },
  };
}

async function main() {
  const reader = createLineReader();
  const answers = [];

  console.log('\\n==============================================================');
  console.log('  KRONVEX // 21-TRIAL MATRIX CLI');
  console.log('  ${VAULT_EPIGRAPH}');
  console.log('==============================================================\\n');

  try {
    for (let i = 0; i < TRIALS.length; i++) {
      const t = TRIALS[i];
      const bar = '#'.repeat(i) + '-'.repeat(TRIALS.length - i);
      const num = String(t.id).padStart(2, '0');
      console.log(\`[MATRIX \${bar}] \${String(i).padStart(2, '0')}/21 · \${t.pillar}\`);
      console.log(\`TRIAL \${num}/21 — \${t.title}\`);
      console.log(\`> \${t.prompt}\`);

      while (true) {
        const line = await reader.ask(\`kronvex[T\${num}]> \`);
        if (line === null) {
          console.log('\\nSession terminated.');
          return;
        }
        const raw = line.trim();
        if (raw.toLowerCase() === 'exit' || raw.toLowerCase() === 'quit') {
          console.log('Session terminated.');
          return;
        }
        const normalized = raw.toUpperCase();
        const digest = sha256Hex(\`KVX21:T\${t.id}:\${normalized}\`);
        if (digest === t.hash) {
          answers.push(normalized);
          console.log(\`[TRIAL \${num}/21 CLEARED]\\n\`);
          break;
        }
        console.log(\`[TRIAL \${num}/21 REJECTED] Signal mismatch. Try again (or type "exit").\`);
      }
    }

    const masterChain = answers.join('|');
    if (sha256Hex(masterChain) !== MASTER_CHAIN_SHA256) {
      console.error('[ERROR] Master chain verification failed.');
      return;
    }

    const payload = decryptVault(masterChain);
    const proof = 'KVX-21-' + sha256Hex(\`\${MASTER_CHAIN_SHA256}:\${Date.now().toString(36).slice(0, 4)}\`).slice(0, 12).toUpperCase();

    console.log('==============================================================');
    console.log(\`  \${payload.vaultTitle}\`);
    console.log(\`  MONOGRAM: \${payload.monogram}  |  ARCHITECT: \${payload.architect} (\${payload.handle})\`);
    console.log('--------------------------------------------------------------');
    console.log(\`  \${payload.epigraph}\`);
    console.log(\`\\n  \${payload.revelation}\\n\`);
    console.log(\`  "\${payload.magicNote}"\`);
    console.log('--------------------------------------------------------------');
    console.log(\`  PROOF: \${proof}\`);
    console.log(\`  WEB VISUAL UNLOCK (paste in kronvex> CLI):\\n  vault chain \${masterChain}\`);
    console.log('==============================================================\\n');
  } finally {
    reader.close();
  }
}

main();
`;
}

