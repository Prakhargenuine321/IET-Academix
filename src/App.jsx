import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import StudentLayout from './layouts/StudentLayout';
import TeacherLayout from './layouts/TeacherLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Home from '../src/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ResetPassword from './pages/Auth/ResetPassword';
import StudentDashboard from './pages/Student/Dashboard';
import Notes from './pages/Student/Notes';
import Syllabus from './pages/Student/Syllabus';
import Videos from './pages/Student/Videos';
import PYQs from './pages/Student/PYQs';
import Community from './pages/Student/Community';
import PreviewPage from './pages/Student/PreviewPage';
import PreviewPageSyllabus from './pages/Student/PreviewPageSyllabus';
import TeacherDashboard from './pages/Teacher/Dashboard';
import TeacherCommunity from './pages/Teacher/Community';
import AdminDashboard from './pages/Admin/Dashboard';
import ManageNotes from './pages/Admin/ManageNotes';
import ManageUsers from './pages/Admin/ManageUsers';
import ManageSyllabus from './pages/Admin/ManageSyllabus';
import ManageVideos from './pages/Admin/ManageVideos';
import ManagePYQs from './pages/Admin/ManagePYQs';
import Announcements from './pages/Admin/Announcements';
import AdminAI from './pages/Admin/AdminAI';
import NotFound from './pages/NotFound';
import ProjectTeam from './components/common/ProjectTeam';
import Unauthorized from './pages/Unauthorized';

function App() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // const handleGetStarted = () => {
  //   if (user && user.role) {
  //     if (user.role === 'student') {
  //       navigate('/student/dashboard');
  //     } else if (user.role === 'teacher') {
  //       navigate('/teacher/dashboard');
  //     } else if (user.role === 'admin') {
  //       navigate('/admin/dashboard');
  //     } else {
  //       navigate('/login');
  //     }
  //   } else {
  //     navigate('/login');
  //   }
  // };

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (loading) {
      return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
    }

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    // TEMPORARY: Allow all authenticated users
    // if (!allowedRoles.includes(user.role)) {
    //   return <Unauthorized />;
    // }

    return children;
  };

  const { user: currentUser } = useAuth();
  if (currentUser && currentUser.role) {
    // navigate based on currentUser.role
  }

  return (
    <Routes>
      {/* ✅ Public Home Page */}
      <Route path="/" element={<Home key="home" />} />

      {/* ✅ Auth Pages */}
      <Route element={<AuthLayout key="auth-layout" />}>
        <Route path="/login" element={<Login key="login" />} />
        <Route path="/register" element={<Register key="register" />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* ✅ Student Pages */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout key="student-layout" />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboard key="student-dashboard" />} />
        <Route path="notes" element={<Notes key="student-notes" />} />
        <Route path="syllabus" element={<Syllabus key="student-syllabus" />} />
        <Route path="videos" element={<Videos key="student-videos" />} />
        <Route path="pyqs" element={<PYQs key="student-pyqs" />} />
        <Route path="community" element={<Community key="student-community" />} />
        <Route path="preview/syllabus/:id" element={<PreviewPageSyllabus key="preview-syllabus" />} />
        <Route path="preview/:type/:id" element={<PreviewPage key="preview-page" />} />
        <Route index element={<Navigate to="/student/dashboard" replace />} />
      </Route>

      {/* ✅ Teacher Pages */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherLayout key="teacher-layout" />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<TeacherDashboard key="teacher-dashboard" />} />
        <Route path="community" element={<TeacherCommunity key="teacher-community" />} />
        <Route index element={<Navigate to="/teacher/dashboard" replace />} />
      </Route>

      {/* ✅ Admin Pages */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout key="admin-layout" />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard key="admin-dashboard" />} />
        <Route path="manage-notes" element={<ManageNotes key="admin-manage-notes" />} />
        <Route path="manage-syllabus" element={<ManageSyllabus key="admin-manage-syllabus" />} />
        <Route path="manage-videos" element={<ManageVideos key="admin-manage-videos" />} />
        <Route path="manage-pyqs" element={<ManagePYQs key="admin-manage-pyqs" />} />
        <Route path="manage-users" element={<ManageUsers key="admin-manage-users" />} />
        <Route path="announcements" element={<Announcements key="admin-announcements" />} />
        <Route path="ai-help" element={<AdminAI key="admin-ai-help" />} />
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* ✅ Project Team Page */}
      <Route path="/project-team" element={<ProjectTeam />} />

      {/* Not Found */}
      <Route path="*" element={<NotFound key="not-found" />} />
    </Routes>
  );
}

export default App;
