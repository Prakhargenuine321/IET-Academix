import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, logoutUser, getCurrentUser } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check for existing session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const userData = await getCurrentUser();
        
        if (userData) {
          setUser(userData);
          
          // Redirect to appropriate dashboard based on role
          if (userData.role === 'student') {
            // navigate('/student/dashboard');
          } else if (userData.role === 'teacher') {
            // navigate('/teacher/dashboard');
          } else if (userData.role === 'admin') {
            // navigate('/admin/dashboard');
          }
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        setError('Session expired. Please login again.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await loginUser(credentials);
      // Extract role from labels
      const role = userData.labels && userData.labels.length > 0 ? userData.labels[0] : 'student';
      setUser({ ...userData, role });
      
      // Redirect based on role
      if (role === 'student') {
        navigate('/student/dashboard');
      } else if (role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/'); // fallback
      }
      
      return { success: true };
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const newUser = await registerUser(userData);
      setUser(newUser);
      
      navigate('/student/dashboard');
      return { success: true };
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;