// Mock resource service
// In a real application, these functions would make API calls to a backend server

// Sample resource data
const resources = {
  notes: [
    {
      id: '1',
      title: 'Data Structures and Algorithms',
      description: 'Comprehensive notes on arrays, linked lists, trees, and graphs',
      branch: 'Computer Science',
      year: '2',
      semester: '1',
      subject: 'Data Structures',
      fileUrl: 'https://www.geeksforgeeks.org/dsa-tutorial-learn-data-structures-and-algorithms/',
      thumbnailUrl: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg',
      uploadedBy: 'Jane Teacher',
      uploadDate: '2023-09-15T10:30:00Z',
      likes: 45,
      views: 120,
      downloads: 67,
      bookmarks: 28,
    },
    {
      id: '2',
      title: 'Database Management Systems',
      description: 'SQL queries, normalization, and transaction management',
      branch: 'Computer Science',
      year: '2',
      semester: '2',
      subject: 'DBMS',
      fileUrl: 'https://example.com/dbms-notes.pdf',
      thumbnailUrl: 'https://images.pexels.com/photos/1181373/pexels-photo-1181373.jpeg',
      uploadedBy: 'John Professor',
      uploadDate: '2023-09-20T14:45:00Z',
      stats: {
        likes: 38,
        views: 95,
        downloads: 52,
        bookmarks: 19,
      },
    },
    {
      id: '3',
      title: 'Computer Networks',
      description: 'OSI model, TCP/IP, and network security fundamentals',
      branch: 'Computer Science',
      year: '3',
      semester: '1',
      subject: 'Networks',
      fileUrl: 'https://example.com/networks-notes.pdf',
      thumbnailUrl: 'https://images.pexels.com/photos/2881229/pexels-photo-2881229.jpeg',
      uploadedBy: 'Jane Teacher',
      uploadDate: '2023-09-25T09:15:00Z',
      stats: {
        likes: 52,
        views: 130,
        downloads: 78,
        bookmarks: 35,
      },
    },
  ],
  
  syllabus: [
    {
      id: '1',
      title: 'Computer Science Curriculum 2023-24',
      description: 'Complete syllabus for all CS courses for the academic year 2023-24',
      branch: 'Computer Science',
      year: 'All',
      semester: 'All',
      fileUrl: 'https://example.com/cs-syllabus.pdf',
      thumbnailUrl: 'https://images.pexels.com/photos/1370296/pexels-photo-1370296.jpeg',
      uploadedBy: 'Admin',
      uploadDate: '2023-08-01T08:00:00Z',
      stats: {
        likes: 120,
        views: 450,
        downloads: 300,
        bookmarks: 80,
      },
    },
    {
      id: '2',
      title: 'Electrical Engineering Syllabus',
      description: 'Electrical Engineering curriculum for 2023-24',
      branch: 'Electrical Engineering',
      year: 'All',
      semester: 'All',
      fileUrl: 'https://example.com/ee-syllabus.pdf',
      thumbnailUrl: 'https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg',
      uploadedBy: 'Admin',
      uploadDate: '2023-08-02T10:30:00Z',
      stats: {
        likes: 85,
        views: 320,
        downloads: 190,
        bookmarks: 45,
      },
    },
  ],
  
  videos: [
    {
      id: '1',
      title: 'Introduction to Machine Learning',
      description: 'Fundamentals of ML algorithms and applications',
      branch: 'Computer Science',
      year: '3',
      semester: '2',
      subject: 'Machine Learning',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg',
      uploadedBy: 'Dr. Sarah Johnson',
      uploadDate: '2023-09-10T15:20:00Z',
      duration: '45:30',
      stats: {
        likes: 75,
        views: 280,
        bookmarks: 42,
      },
    },
    {
      id: '2',
      title: 'Quantum Computing Basics',
      description: 'Introduction to quantum bits and quantum gates',
      branch: 'Computer Science',
      year: '4',
      semester: '1',
      subject: 'Quantum Computing',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.pexels.com/photos/8294611/pexels-photo-8294611.jpeg',
      uploadedBy: 'Prof. Michael Chen',
      uploadDate: '2023-09-18T11:45:00Z',
      duration: '50:15',
      stats: {
        likes: 60,
        views: 180,
        bookmarks: 38,
      },
    },
  ],
  
  pyqs: [
    {
      id: '1',
      title: 'Data Structures Final Exam 2022',
      description: 'Previous year questions for DS final exam',
      branch: 'Computer Science',
      year: '2',
      semester: '1',
      subject: 'Data Structures',
      fileUrl: 'https://example.com/ds-pyq-2022.pdf',
      thumbnailUrl: 'https://images.pexels.com/photos/4145153/pexels-photo-4145153.jpeg',
      uploadedBy: 'Admin',
      uploadDate: '2023-07-20T09:00:00Z',
      stats: {
        likes: 95,
        views: 350,
        downloads: 230,
        bookmarks: 65,
      },
    },
    {
      id: '2',
      title: 'Operating Systems Midterm 2023',
      description: 'Previous year questions for OS midterm',
      branch: 'Computer Science',
      year: '3',
      semester: '1',
      subject: 'Operating Systems',
      fileUrl: 'https://example.com/os-pyq-2023.pdf',
      thumbnailUrl: 'https://images.pexels.com/photos/4145153/pexels-photo-4145153.jpeg',
      uploadedBy: 'Admin',
      uploadDate: '2023-08-15T14:30:00Z',
      stats: {
        likes: 78,
        views: 280,
        downloads: 190,
        bookmarks: 50,
      },
    },
  ],
};

// Helper to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get all resources of a specific type
export const getResources = async (resourceType, filters = {}) => {
  await delay(800); // Simulate network delay
  
  if (!resources[resourceType]) {
    throw new Error(`Invalid resource type: ${resourceType}`);
  }
  
  let filteredResources = [...resources[resourceType]];
  
  // Apply filters
  if (filters.branch && filters.branch !== 'All') {
    filteredResources = filteredResources.filter(r => r.branch === filters.branch);
  }
  
  if (filters.year && filters.year !== 'All') {
    filteredResources = filteredResources.filter(r => r.year === filters.year);
  }
  
  if (filters.semester && filters.semester !== 'All') {
    filteredResources = filteredResources.filter(r => r.semester === filters.semester);
  }
  
  if (filters.subject && filters.subject !== 'All') {
    filteredResources = filteredResources.filter(r => r.subject === filters.subject);
  }
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredResources = filteredResources.filter(r => 
      r.title.toLowerCase().includes(searchLower) || 
      r.description.toLowerCase().includes(searchLower)
    );
  }
  
  return filteredResources;
};

// Get a single resource by ID and type
export const getResourceById = async (resourceType, id) => {
  await delay(500); // Simulate network delay
  
  if (!resources[resourceType]) {
    throw new Error(`Invalid resource type: ${resourceType}`);
  }
  
  const resource = resources[resourceType].find(r => r.id === id);
  
  if (!resource) {
    throw new Error(`Resource not found with ID: ${id}`);
  }
  
  return resource;
};

// Add a new resource
export const addResource = async (resourceType, resourceData) => {
  await delay(1000); // Simulate network delay
  
  if (!resources[resourceType]) {
    throw new Error(`Invalid resource type: ${resourceType}`);
  }
  
  // Validate required fields
  if (!resourceData.title || !resourceData.branch) {
    throw new Error('Missing required fields');
  }
  
  // Create new resource
  const newResource = {
    id: `${resources[resourceType].length + 1}`,
    ...resourceData,
    uploadDate: new Date().toISOString(),
    stats: {
      likes: 0,
      views: 0,
      downloads: 0,
      bookmarks: 0,
    },
  };
  
  // Add to resources (in a real app, this would be saved to a database)
  resources[resourceType].push(newResource);
  
  return newResource;
};

// Update resource stats
export const updateResourceStats = async (resourceType, id, action) => {
  await delay(300); // Simulate network delay
  
  if (!resources[resourceType]) {
    throw new Error(`Invalid resource type: ${resourceType}`);
  }
  
  const index = resources[resourceType].findIndex(r => r.id === id);
  
  if (index === -1) {
    throw new Error(`Resource not found with ID: ${id}`);
  }
  
  // Update the specific stat
  if (action === 'like') {
    resources[resourceType][index].stats.likes += 1;
  } else if (action === 'view') {
    resources[resourceType][index].stats.views += 1;
  } else if (action === 'download') {
    resources[resourceType][index].stats.downloads += 1;
  } else if (action === 'bookmark') {
    resources[resourceType][index].stats.bookmarks += 1;
  }
  
  return resources[resourceType][index];
};

// Delete a resource (admin functionality)
export const deleteResource = async (resourceType, id) => {
  await delay(700); // Simulate network delay
  
  if (!resources[resourceType]) {
    throw new Error(`Invalid resource type: ${resourceType}`);
  }
  
  const index = resources[resourceType].findIndex(r => r.id === id);
  
  if (index === -1) {
    throw new Error(`Resource not found with ID: ${id}`);
  }
  
  // Remove the resource
  resources[resourceType] = resources[resourceType].filter(r => r.id !== id);
  
  return { success: true };
};

export async function updateResource(resourceType, id, updatedData) {
  const response = await fetch(`/api/${resourceType}/${id}`, {
    method: 'PUT', // or 'PATCH' depending on your backend
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    throw new Error('Failed to update resource');
  }

  return await response.json();
}