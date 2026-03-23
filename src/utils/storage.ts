import { openDB, IDBPDatabase } from 'idb';

const THEMES = {
  STRANGER_THINGS: ['Hawkins', 'Demogorgon', 'Upside', 'Eleven', 'Hopper', 'Wheeler', 'Dustin', 'MindFlayer', 'Vecna', 'Creel', 'Byers', 'LabSector', 'Eggo', 'Demodogs'],
  BREAKING_BAD: ['Heisenberg', 'Pinkman', 'Saul', 'Fring', 'Pollos', 'Vamonos', 'Tread', 'Azul', 'Cartel'],
  DARK: ['Winden', 'Kahnwald', 'Nielsen', 'Tannhaus', 'Knot', 'Cycle', 'Origin', 'Triquetra', 'SicMundus'],
  MONEY_HEIST: ['BellaCiao', 'Dali', 'Nairobi', 'Tokyo', 'Berlin', 'Lacasa', 'Professor', 'Mint', 'Royal'],
  SHERLOCK: ['Baker', 'Holmes', 'Moriarty', 'Irene', 'Lestrade', 'Mycroft', 'Baskerville', 'Reichenbach']
};

const SUFFIXES = ['_cache', '_node', '_log', '_tmp', '_store', '_relay', '_sys', '_vault', '_index', '_data', '_v2', '_core', '_pkg', '_bin'];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomFolderName(): string {
  const allThemes = Object.values(THEMES).flat();
  const theme = getRandomElement(allThemes);
  const suffix = getRandomElement(SUFFIXES);
  return `${theme}${suffix}`;
}

export async function initStorage(): Promise<IDBPDatabase> {
  return await openDB('NexoraDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('containers')) {
        db.createObjectStore('containers');
      }
    },
  });
}

/**
 * Simulates the 30-level nested structure by generating a path.
 * In IndexedDB, we store the data with this path as the key.
 */
export function generateNestedPath(): string {
  let path = 'NexoraRoot';
  for (let i = 0; i < 30; i++) {
    path += `/${generateRandomFolderName()}`;
  }
  path += '/encrypted_container';
  return path;
}

export async function storeEncryptedData(db: IDBPDatabase, key: string, data: any) {
  await db.put('containers', data, key);
}

export async function getEncryptedData(db: IDBPDatabase, key: string) {
  return await db.get('containers', key);
}

export async function deleteEncryptedData(db: IDBPDatabase, key: string) {
  await db.delete('containers', key);
}

export async function clearAllStorage(db: IDBPDatabase) {
  await db.clear('containers');
}
