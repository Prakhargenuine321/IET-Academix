// src/lib/appwrite.js
import { Client, Account, Databases, ID, Storage, Messaging, Permission, Role, Query } from 'appwrite';

const client = new Client();

client
  .setEndpoint('https://fra.cloud.appwrite.io/v1') // Replace with your Appwrite endpoint
  .setProject('6821f25c0015d64a5520'); // Replace with your Appwrite project ID

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client); // Initialize the Storage object
export const messaging = new Messaging(client); // Initialize Messaging
export {ID};


const DATABASE_ID = '682226b20031e283d0c2'; //Appwrite database ID here
const COLLECTION_ID = '682226c2002333e24c49'; //Appwrite collection ID here
const SYLLABUS_COLLECTION_ID = '682378e1002c72af9025'; //Syllabus collection ID here
const BUCKET_ID = '68237b7c001bb75250b8'; //Bucket ID here
const ANNOUNCEMENT_ID = '6827803c0028e1d0a910'; //Announcement ID here
const VIDEOS_COLLECTION_ID = '68289ba800093d6482c3'; //Video collection ID here
const PYQ_COLLECTION_ID = '6828cc620034fa61a6d9'; //PYQ collection ID here
const USER_COLLECTION_ID = '6827a9c1001c77e4485f'; //USER collection ID here
 
export const getCurrentUser = async () => {
  try {
    return await account.get();
  } catch {
    return null;
  }
};

// Fetch notes from Appwrite database
export const getResources = async (type, id = null) => {
  if (type !== 'notes') return [];

  try {
    const user = await account.get();
    if (!user) throw new Error('User not authenticated');

    if (id) {
      const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, id);
      return formatDocument(doc);
    } else {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
      return response.documents.map(formatDocument);
    }
  } catch (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }
};

export const createNote = async (data) => {
  try {
    const user = await account.get();
    if (!user) throw new Error('User not authenticated');

    const newDoc = await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), data);
    return formatDocument(newDoc);
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
};

export const updateNote = async (id, data) => {
  try {
    const user = await account.get();
    if (!user) throw new Error('User not authenticated');

    const updatedDoc = await databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, data);
    return formatDocument(updatedDoc);
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};

export const deleteNote = async (id) => {
  try {
    const user = await account.get();
    if (!user) throw new Error('User not authenticated');

    await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};

export const updateNoteStats = async (id, stats) => {
  try {
    const user = await account.get(); // Ensure the user is authenticated
    if (!user) throw new Error("User not authenticated");

    // Handle user-specific actions (e.g., add/remove user ID from likedBy, viewedBy, downloadedBy)
    if (stats.likedBy) {
      const document = await databases.getDocument(DATABASE_ID, COLLECTION_ID, id);
      const likedBy = document.likedBy || [];

      if (stats.likedBy === "add") {
        stats.likedBy = [...likedBy, user.$id];
      } else if (stats.likedBy === "remove") {
        stats.likedBy = likedBy.filter((userId) => userId !== user.$id);
      }
    }

    if (stats.viewedBy) {
      const document = await databases.getDocument(DATABASE_ID, COLLECTION_ID, id);
      const viewedBy = document.viewedBy || [];
      stats.viewedBy = [...new Set([...viewedBy, user.$id])];
    }

    if (stats.downloadedBy) {
      const document = await databases.getDocument(DATABASE_ID, COLLECTION_ID, id);
      const downloadedBy = document.downloadedBy || [];
      stats.downloadedBy = [...new Set([...downloadedBy, user.$id])];
    }

    const updatedDoc = await databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, stats);
    return updatedDoc;
  } catch (error) {
    console.error("Error updating stats:", error);
    throw error;
  }
};

// Upload syllabus directly to the database without file upload
export const uploadSyllabus = async ({ title, branch, semester, year, subject, description, thumbnailUrl, fileUrl }) => {
  try {
    // Save the syllabus details in the database
    const syllabusData = {
      title,
      branch,
      semester: parseInt(semester, 10), // Ensure semester is sent as a string
      year: parseInt(year, 10), // Ensure year is sent as a string
      subject,
      description,
      thumbnailUrl: thumbnailUrl || '', // Ensure thumbnailUrl is included, even if empty
      fileUrl, // Directly use the file URL provided
      uploadedBy: 'Admin', // Replace with the actual admin name or ID
      // uploadDate: new Date().toISOString(), // Ensure uploadDate is included
    };

    const response = await databases.createDocument(DATABASE_ID, SYLLABUS_COLLECTION_ID, ID.unique(), syllabusData);
    return response;
  } catch (error) {
    console.error('Error uploading syllabus:', error);
    throw error;
  }
};

// Fetch syllabus from the database
export const getSyllabus = async () => {
  try {
    const response = await databases.listDocuments(DATABASE_ID, SYLLABUS_COLLECTION_ID);
    return response.documents;
  } catch (error) {
    console.error('Error fetching syllabus:', error);
    throw error;
  }
};

// Fetch a single syllabus by ID
export const getSyllabusById = async (id) => {
  try {
    const doc = await databases.getDocument(DATABASE_ID, SYLLABUS_COLLECTION_ID, id);
    return doc;
  } catch (error) {
    console.error('Error fetching syllabus by ID:', error);
    throw error;
  }
};

// Delete syllabus from the database
export const deleteSyllabus = async (id) => {
  try {
    await databases.deleteDocument(DATABASE_ID, SYLLABUS_COLLECTION_ID, id);
  } catch (error) {
    console.error('Error deleting syllabus:', error);
    throw error;
  }
};

//it will update the syllabus
export const updateSyllabus = async (id, data) => {
  try {
    return await databases.updateDocument(DATABASE_ID, SYLLABUS_COLLECTION_ID, id, data);
  } catch (error) {
    console.error('Error updating syllabus:', error);
    throw error;
  }
};

export const uploadFileToAppwrite = async (file) => {
  const response = await storage.createFile(BUCKET_ID, ID.unique(), file, [
    Permission.read(Role.any()), // or your preferred permissions
  ]);
  return response; // response contains $id and bucketId
};

export const saveSyllabusToDatabase = async (syllabusData) => {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      'unique()', // Generate a unique document ID
      syllabusData
    );
    return response;
  } catch (error) {
    console.error('Error saving syllabus to Appwrite database:', error);
    throw error;
  }
};

// Subscribe to a messaging channel
export const subscribeToChannel = (channel, callback) => {
  try {
    const unsubscribe = messaging.subscribe(channel, callback); // Subscribe to the channel
    return unsubscribe; // Return the unsubscribe function
  } catch (error) {
    console.error('Error subscribing to channel:', error);
    throw error;
  }
};


//creating announcement function

export const createAnnouncement = async (data) => {
  return databases.createDocument(
    DATABASE_ID,
    ANNOUNCEMENT_ID,
    ID.unique(), // auto-generate ID
    data
  );
};


//fetching stored announcement
export const fetchAnnouncements = async () => {
  const response = await databases.listDocuments(
    DATABASE_ID,
    ANNOUNCEMENT_ID,//collection ID
  );
  return response.documents;
};

export const deleteAnnouncement = async(docId) => {
  return databases.deleteDocument(
    DATABASE_ID,
    ANNOUNCEMENT_ID,
    docId
  )
}

export const fetchUserNotifications = async (userBranch) => {
  const response = await databases.listDocuments(
    DATABASE_ID,
    ANNOUNCEMENT_ID,
    [
      Query.or([
        Query.contains('target', ['all']),
        Query.contains('target', [userBranch])
      ])
    ]
  );
  return response.documents;
};

// Create a new video
export const createVideo = async (videoData) => {
  return databases.createDocument(
    DATABASE_ID,
    VIDEOS_COLLECTION_ID,
    ID.unique(),
    videoData
  );
};

// Fetch all videos (optionally filter by branch, year, etc.)
export const fetchVideos = async (filters = []) => {
  const response = await databases.listDocuments(
    DATABASE_ID,
    VIDEOS_COLLECTION_ID,
    filters
  );
  return response.documents;
};

export const updateVideo = async (videoId, videoData) => {
  // Only send fields that exist in your collection
  const allowed = [
    "title",
    "description",
    "branch",
    "year",
    "semester",
    "fileUrl",
    "thumbnailUrl"
  ];
  const sanitized = {};
  allowed.forEach(key => {
    if (videoData[key] !== undefined) sanitized[key] = videoData[key];
  });

  return databases.updateDocument(
    DATABASE_ID,
    VIDEOS_COLLECTION_ID,
    videoId,
    sanitized
  );
};


// Delete a video
export const deleteVideo = async (videoId) => {
  return databases.deleteDocument(
    DATABASE_ID,
    VIDEOS_COLLECTION_ID,
    videoId
  );
};


// Create PYQ
export const createPYQ = async (pyqData) => {
  const allowed = [
    "title",
    "description",
    "branch",
    "year",
    "semester",
    "fileUrl",
    "thumbnailUrl"
  ];
  const sanitized = {};
  allowed.forEach(key => {
    if (pyqData[key] !== undefined) sanitized[key] = pyqData[key];
  });
  return databases.createDocument(
    DATABASE_ID,
    PYQ_COLLECTION_ID,
    ID.unique(),
    sanitized
  );
};


// Fetch all PYQs
export const fetchPYQs = async (filters = []) => {
  const response = await databases.listDocuments(
    DATABASE_ID,
    PYQ_COLLECTION_ID,
    filters
  );
  return response.documents;
};



// Update PYQ
export const updatePYQ = async (pyqId, pyqData) => {
  const allowed = [
    "title",
    "description",
    "branch",
    "year",
    "semester",
    "fileUrl",
    "thumbnailUrl"
  ];
  const sanitized = {};
  allowed.forEach(key => {
    if (pyqData[key] !== undefined) sanitized[key] = pyqData[key];
  });
  return databases.updateDocument(
    DATABASE_ID,
    PYQ_COLLECTION_ID,
    pyqId,
    sanitized
  );
};


// Delete PYQ
export const deletePYQ = async (pyqId) => {
  return databases.deleteDocument(
    DATABASE_ID,
    PYQ_COLLECTION_ID,
    pyqId
  );
};


// Fetch and combine recent resources (syllabus, videos, PYQs)
export const getRecentResources = async () => {
  try {
    // Fetch all resources in parallel
    const [syllabus, videos, pyqs, notes] = await Promise.all([
      getSyllabus(),
      fetchVideos(),
      fetchPYQs(),
      getResources()
    ]);

    // Format all resources to a common structure and add a type
    const formattedSyllabus = syllabus.map(doc => ({
      ...formatDocument(doc),
      type: 'syllabus'
    }));
    const formattedVideos = videos.map(doc => ({
      ...formatDocument(doc),
      type: 'video'
    }));
    const formattedPYQs = pyqs.map(doc => ({
      ...formatDocument(doc),
      type: 'pyq'
    }));

    const formattedNotes = notes.map(doc =>({
      ...formatDocument(doc),
      type: 'notes'
    }));

    // Combine all resources
    const combined = [...formattedSyllabus, ...formattedVideos, ...formattedPYQs, ...formattedNotes];

    // Sort by uploadDate (descending), fallback to 0 if missing
    combined.sort((a, b) => new Date(b.uploadDate || 0) - new Date(a.uploadDate || 0));

    // Return the 5 most recent
    return combined.slice(0, 5);
  } catch (error) {
    console.error('Error fetching recent resources:', error);
    throw error;
  }
};

// Create a new user in the user collection
export const createUser = async (userData) => {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      USER_COLLECTION_ID,
      ID.unique(),
      userData
    );
    return response;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Fetch all users
export const fetchUsers = async () => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      USER_COLLECTION_ID
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Update a user by ID
export const updateUser = async (userId, userData) => {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID,
      USER_COLLECTION_ID,
      userId,
      userData
    );
    return response;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Delete a user by ID
export const deleteUser = async (userId) => {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      USER_COLLECTION_ID,
      userId
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Format document for consistent structure
const formatDocument = (doc) => ({
  id: doc.$id,
  title: doc.title,
  description: doc.description,
  branch: doc.branch,
  year: doc.year,
  semester: doc.semester,
  subject: doc.subject,
  fileUrl: doc.fileUrl,
  thumbnailUrl: doc.thumbnailUrl,
  uploadedBy: doc.uploadedBy,
  uploadDate: doc.uploadDate,
  likes: doc.likes,
  views: doc.views,
  downloads: doc.downloads,
  bookmarks: doc.bookmarks,
});
