import dbConnect from './mongodb';
import User from '@/models/User';
import ZoomEntry from '@/models/Entry';

export interface ZoomEntryType {
  id: string;
  gmail: string;
  password: string;
  startDate: string;
  endDate: string;
  accountNo: '1' | '2';
  mobileNumber: string;
  createdAt: string;
}

export interface UserType {
  email: string;
  password: string;
}

// Initialize default user if not exists
export async function initUser() {
  await dbConnect();
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    await User.create({
      email: 'letsshopbd24@gmail.com',
      password: 'letsshopbd24@#@##', // In production, hash this!
    });
    console.log('Default user created');
  }
}

// Get all entries
export async function getEntries() {
  await dbConnect();
  const entries = await ZoomEntry.find({}).sort({ createdAt: -1 });
  return entries;
}

// Add new entry
export async function addEntry(entry: Omit<ZoomEntryType, 'id' | 'createdAt'>) {
  await dbConnect();
  const newEntry = await ZoomEntry.create(entry);
  return newEntry;
}

// Get user by email
export async function getUserByEmail(email: string) {
  await dbConnect();
  // Ensure default user exists
  await initUser();
  const user = await User.findOne({ email });
  return user;
}

// Update entry
export async function updateEntry(id: string, updates: Partial<Omit<ZoomEntryType, 'id' | 'createdAt'>>) {
  await dbConnect();
  const updatedEntry = await ZoomEntry.findByIdAndUpdate(id, updates, { new: true });
  return updatedEntry;
}

// Delete entry
export async function deleteEntry(id: string) {
  await dbConnect();
  const result = await ZoomEntry.findByIdAndDelete(id);
  return !!result;
}
