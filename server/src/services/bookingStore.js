import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../../data/bookings.json');

/**
 * Initializes the data directory and file if not present
 */
async function initStore() {
  try {
    const dir = path.dirname(DATA_FILE);
    await fs.mkdir(dir, { recursive: true });
    try {
      await fs.access(DATA_FILE);
    } catch {
      await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Failed to initialize booking store:', err);
  }
}

initStore();

/**
 * Retrieves all bookings from storage
 */
export async function getAllBookings() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.warn('Could not read bookings file, returning empty array:', err.message);
    return [];
  }
}

/**
 * Saves a new booking record
 */
export async function saveBooking(bookingRecord) {
  const bookings = await getAllBookings();
  bookings.unshift(bookingRecord);
  await fs.writeFile(DATA_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
  return bookingRecord;
}
