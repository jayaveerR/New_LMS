import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { user, userRole, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate("/auth", { state: { from: location } });
                return;
            }

            // If user is admin/manager, always send to their portal regardless of approval_status
            if (['admin', 'manager'].includes(userRole || '')) {
                if (location.pathname === '/pending-approval') {
                    const portal = userRole === 'admin' ? '/admin' : '/manager';
                    navigate(portal);
                    return;
                }
                // Skip any further approval checks for admins/managers
            } else {
                // For non-admin/manager users: redirect pending users
                if (user.approval_status === 'pending' && location.pathname !== '/pending-approval') {
                    navigate('/pending-approval');
                    return;
                }

                // If now approved but stuck on pending page, redirect to their dashboard
                if (user.approval_status === 'approved' && location.pathname === '/pending-approval') {
                    navigate('/student-dashboard');
                    return;
                }
            }

            // Check roles
            if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
                navigate("/student-dashboard");
            }
        }
    }, [user, userRole, loading, navigate, location, allowedRoles]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    return <>{children}</>;
};
