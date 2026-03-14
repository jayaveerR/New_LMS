import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import LearningPaths from "./pages/LearningPaths";
import InstructorRegister from "./pages/InstructorRegister";
import Dashboard from "./pages/Dashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LiveSession from "./pages/LiveSession";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Assignments from "./pages/Assignments";
import PendingApproval from "./pages/PendingApproval";
import Courses from "./pages/Courses";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/about" element={<About />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pending-approval" element={<ProtectedRoute><PendingApproval /></ProtectedRoute>} />
            <Route path="/become-instructor" element={<InstructorRegister />} />
            <Route path="/learning-paths" element={<LearningPaths />} />

            <Route
              path="/student-dashboard/*"
              element={<ProtectedRoute allowedRoles={['student', 'instructor', 'admin']}><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="/instructor/*"
              element={<ProtectedRoute allowedRoles={['instructor', 'admin']}><InstructorDashboard /></ProtectedRoute>}
            />
            <Route
              path="/manager/*"
              element={<ProtectedRoute allowedRoles={['manager', 'admin']}><ManagerDashboard /></ProtectedRoute>}
            />
            <Route
              path="/admin/*"
              element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>}
            />

            <Route path="/live/:meetingId" element={<ProtectedRoute><LiveSession /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
