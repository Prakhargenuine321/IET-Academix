// Mock authentication service
// In a real application, these functions would make API calls to a backend server

import { account } from '../appwrite';

// Simulated user database
// const users = [
//   {
//     id: '1',
//     name: 'John Student',
//     email: 'student@example.com',
//     phone: '1234567890',
//     password: 'password123',
//     role: 'student',
//     rollNo: 'CS2001',
//     branch: 'Computer Science',
//     createdAt: '2023-01-15T10:30:00Z',
//   },
//   {
//     id: '2',
//     name: 'Jane Teacher',
//     email: 'teacher@example.com',
//     phone: '0987654321',
//     password: 'password123',
//     role: 'teacher',
//     department: 'Computer Science',
//     createdAt: '2023-01-10T08:30:00Z',
//   },
//   {
//     id: '3',
//     name: 'Admin User',
//     email: 'admin@example.com',
//     phone: '5555555555',
//     password: 'password123',
//     role: 'admin',
//     createdAt: '2023-01-01T00:00:00Z',
//   },
// ];

// Helper to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Login user with Appwrite
export const loginUser = async (credentials) => {
  if (!credentials.identifier || !credentials.password) {
    throw new Error('Email and password are required');
  }
  try {
    // Appwrite only supports login by email
    // If you want to allow phone/rollNo, you must map them to email before calling this
    const session = await account.createEmailPasswordSession(credentials.identifier, credentials.password);
    const user = await account.get();
    // Optionally, store user in localStorage for session persistence
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (err) {
    throw new Error(err.message || 'Login failed');
  }
};

// Register a new user with Appwrite
export const registerUser = async (userData) => {
  if (!userData.name || !userData.email || !userData.password) {
    throw new Error('Name, email, and password are required');
  }
  try {
    // You (admin) will create users from Appwrite Console, so this is optional for students
    const user = await account.create(
      'unique()',
      userData.email,
      userData.password,
      userData.name
    );
    // Optionally, log them in after registration
    await account.createEmailPasswordSession(userData.email, userData.password);
    const currentUser = await account.get();
    localStorage.setItem('user', JSON.stringify(currentUser));
    return currentUser;
  } catch (err) {
    throw new Error(err.message || 'Registration failed');
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await account.deleteSession('current');
    localStorage.removeItem('user');
    return { success: true };
  } catch (err) {
    throw new Error(err.message || 'Logout failed');
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const user = await account.get();
    return user;
  } catch (err) {
    return null;
  }
};

// Send password reset email
export const sendPasswordReset = async (email, redirectUrl) => {
  try {
    await account.createRecovery(email, redirectUrl); // redirectUrl is where user will be sent after clicking reset link
    return { success: true };
  } catch (err) {
    throw new Error(err.message || 'Failed to send password reset email');
  }
};