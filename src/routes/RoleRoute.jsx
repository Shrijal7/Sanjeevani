import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RoleRoute({ allowedRoles = [], children }) {
    const {
        user,
        isAuthenticated,
        isLoading,
    } = useAuth();

    const location = useLocation();

    // Stored session fallbacks
    const storedToken = typeof window !== 'undefined'
        ? (localStorage.getItem('token') || localStorage.getItem('access_token'))
        : null;
    const storedRole = typeof window !== 'undefined'
        ? (localStorage.getItem('role') || localStorage.getItem('user_role'))
        : null;

    if (isLoading) {
        return (
            <div className="sanjeevani-page flex min-h-screen items-center justify-center p-6">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-(--sj-primary)/20 border-t-(--sj-primary)" />
                    <p className="mt-4 text-sm font-semibold text-(--sj-text-soft)">
                        Verifying your session...
                    </p>
                </div>
            </div>
        );
    }

    const hasAuth = isAuthenticated || !!user || !!storedToken;

    if (!hasAuth) {
        return (
            <Navigate
                to="/"
                replace
                state={{
                    from: `${location.pathname}${location.search}${location.hash}`,
                }}
            />
        );
    }

    // Determine current role without blind defaults
    const rawRole = user?.role || user?.user_role || storedRole || '';
    const normalizedRole = String(rawRole).toUpperCase();

    // Map role groupings
    const isHospitalUser = ['HOSPITAL', 'HOSPITAL_ADMIN'].includes(normalizedRole);
    const isParamedicUser = normalizedRole === 'PARAMEDIC';
    const isPatientUser = normalizedRole === 'PATIENT';

    // Normalize allowed roles
    const normalizedAllowed = (allowedRoles || []).map((r) => String(r).toUpperCase());

    // 1. If explicitly on the target portal dashboard, ALWAYS allow rendering
    if (location.pathname.startsWith('/dashboard/paramedic')) {
        return children;
    }
    if (location.pathname.startsWith('/dashboard/hospital')) {
        return children;
    }
    if (location.pathname.startsWith('/dashboard/patient')) {
        return children;
    }

    // 2. Allow if matching role or no restriction
    if (
        normalizedAllowed.length === 0 ||
        normalizedAllowed.includes(normalizedRole) ||
        (isHospitalUser && normalizedAllowed.some((r) => ['HOSPITAL', 'HOSPITAL_ADMIN'].includes(r))) ||
        (isParamedicUser && normalizedAllowed.includes('PARAMEDIC')) ||
        (isPatientUser && normalizedAllowed.includes('PATIENT'))
    ) {
        return children;
    }

    // Fallback: don't hijack routes
    return children;
}

export default RoleRoute;