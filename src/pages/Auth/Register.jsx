import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiMail, FiPhone, FiLock, FiHash, FiCheckCircle
} from 'react-icons/fi';
import { account, ID, createUser } from '../../../src/appwrite'; // adjust as needed // Your backend API to insert users in DB

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    branch: '',
    rollNo: '',
    password: '',
    confirmPassword: '',
  });
  const [googleUser, setGoogleUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // After redirect from Google login
    const checkAuth = async () => {
      try {
        const user = await account.get();
        if (user && user.email) {
          setGoogleUser(user);
          setFormData(prev => ({ ...prev, email: user.email }));
        }
      } catch (err) {
        // No session or not logged in
      }
    };
    checkAuth();
  }, []);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await account.createOAuth2Session(
        'google',
        `${window.location.origin}/register`, // Redirect here after login
        `${window.location.origin}/register`  // On failure too
      );
    } catch (err) {
      setError('Google login failed');
      setGoogleLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.phone.trim()) return 'Phone is required';
    if (!formData.branch.trim()) return 'Branch is required';
    if (!formData.rollNo.trim()) return 'Roll Number is required';
    if (!formData.password.trim()) return 'Password is required';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) return setError(validationError);

    if (!googleUser) return setError('Google login required before registration');

    setLoading(true);
    try {
      // Save additional data in your custom DB, not in Appwrite Auth again
      await createUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        branch: formData.branch,
        rollNo: formData.rollNo,
        role: 'student',
        authId: googleUser.$id
      });

      setSuccess('Registration successful!');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const branchOptions = [
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electronics Engineering'
  ];

  // If not logged in, show Google sign-in
  if (!googleUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="mb-6 text-center text-2xl font-bold">Register with Google</h2>
        {error && <div className="text-red-600 mb-3">{error}</div>}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="btn btn-primary"
        >
          {googleLoading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Success Popup */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-100 border border-green-300 text-green-800 px-6 py-3 rounded-lg shadow-lg"
          >
            <FiCheckCircle className="mr-2 inline-block" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-center mb-6">Complete Registration</h2>

        {error && <div className="text-red-600 mb-3">{error}</div>}

        {/* Name */}
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required className="input mb-3" />

        {/* Email (disabled) */}
        <input type="email" name="email" value={formData.email} disabled className="input mb-3" />

        {/* Phone */}
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" required className="input mb-3" />

        {/* Roll Number */}
        <input type="text" name="rollNo" value={formData.rollNo} onChange={handleChange} placeholder="Roll Number" required className="input mb-3" />

        {/* Branch */}
        <select name="branch" value={formData.branch} onChange={handleChange} required className="input mb-3">
          <option value="">Select Branch</option>
          {branchOptions.map(branch => <option key={branch}>{branch}</option>)}
        </select>

        {/* Password */}
        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required className="input mb-3" />

        {/* Confirm Password */}
        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" required className="input mb-4" />

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;
