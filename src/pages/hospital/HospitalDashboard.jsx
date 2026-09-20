import React, { useState, useEffect } from 'react';
import {
    Activity,
    Ambulance,
    Bed,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Hospital,
    MapPin,
    MoreHorizontal,
    Phone,
    RefreshCw,
    ShieldCheck,
    Siren,
    Users,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import HospitalNavbar from '../../components/layout/HospitalNavbar';
import { useTheme } from '../../context/ThemeContext';
import { getHospitalEmergencies, updateTriageAdmission } from '../../services/api';

const MOCK_HOSPITAL = {
    name: 'Sanjeevani Emergency Hospital',
    type: 'Multi-Specialty Hospital',
    city: 'New Delhi',
    state: 'Delhi',
    status: 'VERIFIED',
    applicationId: 'HSP-2026-00421',
};

const MOCK_AMBULANCES = [
    {
        id: 'AMB-042',
        type: 'ALS',
        driver: 'Rohan Mehta',
        status: 'On mission',
        location: 'Connaught Place',
    },
    {
        id: 'AMB-038',
        type: 'BLS',
        driver: 'Amit Kumar',
        status: 'Available',
        location: 'Hospital',
    },
    {
        id: 'AMB-031',
        type: 'ALS',
        driver: 'Neeraj Singh',
        status: 'Available',
        location: 'Hospital',
    },
];

const MOCK_ACTIVITY = [
    {
        icon: Ambulance,
        title: 'Ambulance AMB-042 assigned',
        description: 'Emergency EM-2026-00130',
        time: '8 min ago',
    },
    {
        icon: Users,
        title: 'Paramedic Rohan Mehta accepted mission',
        description: 'Emergency response initiated',
        time: '9 min ago',
    },
    {
        icon: Siren,
        title: 'New emergency request received',
        description: 'Location: Connaught Place',
        time: '12 min ago',
    },
    {
        icon: Bed,
        title: 'Capacity information updated',
        description: 'Emergency beds: 14 available',
        time: '32 min ago',
    },
];

const CAPACITY = [
    {
        label: 'Total beds',
        available: 46,
        total: 120,
    },
    {
        label: 'Emergency beds',
        available: 14,
        total: 24,
    },
    {
        label: 'ICU beds',
        available: 6,
        total: 18,
    },
    {
        label: 'Ventilators',
        available: 5,
        total: 12,
    },
];

const SERVICES = [
    '24×7 Emergency',
    'Trauma Care',
    'ICU',
    'NICU',
    'Cardiology',
    'Neurology',
];

function StatusBadge({ children, tone = 'success' }) {
    const toneClasses = {
        success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        danger: 'bg-red-500/10 text-red-600 dark:text-red-400',
        info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        neutral: 'bg-(--sj-surface-2) text-(--sj-text-soft)',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${toneClasses[tone]}`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${
                    tone === 'danger'
                        ? 'bg-red-500'
                        : tone === 'warning'
                          ? 'bg-amber-500'
                          : tone === 'info'
                            ? 'bg-blue-500'
                            : tone === 'success'
                              ? 'bg-emerald-500'
                              : 'bg-(--sj-text-muted)'
                }`}
            />
            {children}
        </span>
    );
}

function HospitalDashboard() {
    const navigate = useNavigate();
    const { theme } = useTheme();

    const [liveQueue, setLiveQueue] = useState([]);
    const [loadingQueue, setLoadingQueue] = useState(false);
    const [admittingId, setAdmittingId] = useState(null);

    const fetchLiveTriageQueue = async () => {
        try {
            setLoadingQueue(true);
            const data = await getHospitalEmergencies();
            if (Array.isArray(data)) {
                setLiveQueue(data);
            }
        } catch (err) {
            console.error('Failed to sync live hospital queue:', err);
        } finally {
            setLoadingQueue(false);
        }
    };

    useEffect(() => {
        fetchLiveTriageQueue();
        const poller = setInterval(fetchLiveTriageQueue, 5000);
        return () => clearInterval(poller);
    }, []);

    const handleConfirmAdmission = async (e, requestId) => {
        e.stopPropagation();
        setAdmittingId(requestId);
        try {
            await updateTriageAdmission(requestId, 'ADMITTED');
            await fetchLiveTriageQueue();
        } catch (err) {
            alert(err.message || 'Failed to update intake status');
        } finally {
            setAdmittingId(null);
        }
    };

    const getSeverityTone = (severity) => {
        const s = String(severity || '').toUpperCase();
        if (s === 'CRITICAL') return 'danger';
        if (s === 'HIGH') return 'warning';
        return 'info';
    };

    const activeInboundCount = liveQueue.filter(
        (q) => q.status !== 'ADMITTED' && q.status !== 'RESOLVED'
    ).length;

    const stats = [
        {
            label: 'Emergency requests',
            value: liveQueue.length > 0 ? String(liveQueue.length) : '12',
            helper: 'Total tracked',
            icon: Siren,
            tone: 'danger',
            path: '/dashboard/hospital/emergencies',
        },
        {
            label: 'Active emergencies',
            value: String(activeInboundCount),
            helper: 'Inbound / In-triage',
            icon: Activity,
            tone: 'warning',
            path: '/dashboard/hospital/emergencies',
        },
        {
            label: 'Available ambulances',
            value: '5',
            helper: 'of 8 total',
            icon: Ambulance,
            tone: 'primary',
            path: '/dashboard/hospital/ambulances',
        },
        {
            label: 'Available paramedics',
            value: '9',
            helper: 'of 14 total',
            icon: Users,
            tone: 'info',
            path: '/dashboard/hospital/paramedics',
        },
    ];

    return (
        <div className="sanjeevani-page min-h-screen">
            <HospitalNavbar />

            <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                    <div className="min-w-0">
                        {/* Header */}
                        <div className="mb-6">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-(--sj-primary)">
                                Hospital command center
                            </p>

                            <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                                <div>
                                    <h1 className="text-3xl font-black tracking-[-0.035em] text-(--sj-text) sm:text-4xl">
                                        Good afternoon, Admin
                                    </h1>

                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-(--sj-text-soft)">
                                        Live intake queue, inbound triage coordination, and capacity telemetry.
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={fetchLiveTriageQueue}
                                        disabled={loadingQueue}
                                        className="inline-flex items-center gap-2 rounded-xl border border-(--sj-border) bg-(--sj-surface) px-3 py-2 text-xs font-bold text-(--sj-text) transition hover:bg-(--sj-surface-2) disabled:opacity-50"
                                    >
                                        <RefreshCw className={`h-3.5 w-3.5 ${loadingQueue ? 'animate-spin' : ''}`} />
                                        Sync queue
                                    </button>

                                    <span className="sj-live">
                                        <span className="sj-live-dot" />
                                        <span className="text-xs font-bold text-(--sj-text-soft)">
                                            Triage Live
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Top 4 Stats */}
                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {stats.map((stat) => {
                                const Icon = stat.icon;
                                const iconTone =
                                    stat.tone === 'danger'
                                        ? 'bg-red-500/10 text-red-500'
                                        : stat.tone === 'warning'
                                          ? 'bg-amber-500/10 text-amber-500'
                                          : stat.tone === 'info'
                                            ? 'bg-blue-500/10 text-blue-500'
                                            : 'bg-(--sj-primary)/10 text-(--sj-primary)';

                                return (
                                    <Link
                                        key={stat.label}
                                        to={stat.path}
                                        className="sj-card group block p-5 transition hover:-translate-y-0.5 hover:border-(--sj-primary)/30 hover:shadow-lg"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-xs font-bold text-(--sj-text-muted)">
                                                    {stat.label}
                                                </p>
                                                <p className="mt-3 text-3xl font-black tracking-tight text-(--sj-text)">
                                                    {stat.value}
                                                </p>
                                                <p className="mt-1 text-[11px] font-semibold text-(--sj-text-muted)">
                                                    {stat.helper}
                                                </p>
                                            </div>

                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconTone}`}
                                            >
                                                <Icon className="h-5 w-5" />
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between border-t border-(--sj-border) pt-3">
                                            <span className="text-[10px] font-bold text-(--sj-text-muted)">
                                                Open module
                                            </span>
                                            <ChevronRight className="h-4 w-4 text-(--sj-text-muted) transition group-hover:translate-x-0.5 group-hover:text-(--sj-primary)" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </section>

                        {/* Real-Time Live Triage Feed Section */}
                        <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                            <div className="sj-card overflow-hidden">
                                <div className="flex items-center justify-between border-b border-(--sj-border) px-5 py-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                            <p className="text-sm font-black text-(--sj-text)">
                                                Live Inbound Emergency Triage
                                            </p>
                                        </div>
                                        <p className="mt-1 text-xs text-(--sj-text-muted)">
                                            Real-time hospital admission and ambulance dispatch alerts
                                        </p>
                                    </div>

                                    <Link
                                        to="/dashboard/hospital/emergencies"
                                        className="hidden items-center gap-1 text-xs font-black text-(--sj-primary) sm:inline-flex"
                                    >
                                        View history
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </div>

                                <div className="divide-y divide-(--sj-border)">
                                    {liveQueue.length > 0 ? (
                                        liveQueue.map((emergency) => (
                                            <div
                                                key={emergency.id}
                                                className="flex flex-col gap-3 px-5 py-4 transition hover:bg-(--sj-surface-2) sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500 sm:flex">
                                                        <Siren className="h-5 w-5 animate-pulse" />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="text-sm font-black text-(--sj-text)">
                                                                {emergency.emergency_type || 'Acute Emergency'}
                                                            </p>

                                                            <StatusBadge
                                                                tone={getSeverityTone(emergency.priority)}
                                                            >
                                                                {emergency.priority || 'CRITICAL'}
                                                            </StatusBadge>

                                                            <span className="text-[10px] font-mono text-(--sj-text-muted)">
                                                                {emergency.id?.slice(0, 8)}
                                                            </span>
                                                        </div>

                                                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(--sj-text-muted)">
                                                            <span className="inline-flex items-center gap-1">
                                                                <MapPin className="h-3.5 w-3.5 text-(--sj-primary)" />
                                                                {emergency.address_text || 'GPS Coords Shared'}
                                                            </span>

                                                            {emergency.dispatch && (
                                                                <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                                                                    <Ambulance className="h-3.5 w-3.5" />
                                                                    Unit: {emergency.dispatch.vehicle_number || 'UP-70-EM-1001'}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="mt-1.5 text-xs font-semibold text-(--sj-text-soft)">
                                                            Phone: {emergency.requester_phone || 'Direct Patient App'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <span className={`rounded-xl px-3 py-1 text-xs font-bold ${
                                                        emergency.status === 'ADMITTED'
                                                            ? 'bg-emerald-500/10 text-emerald-600'
                                                            : 'bg-amber-500/10 text-amber-600 animate-pulse'
                                                    }`}>
                                                        {emergency.status}
                                                    </span>

                                                    {emergency.status !== 'ADMITTED' && (
                                                        <button
                                                            onClick={(e) => handleConfirmAdmission(e, emergency.id)}
                                                            disabled={admittingId === emergency.id}
                                                            className="flex items-center gap-1.5 rounded-xl bg-(--sj-primary) px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-(--sj-primary-dark) disabled:opacity-50"
                                                        >
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                            {admittingId === emergency.id ? 'Admitting...' : 'Confirm Intake'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-xs text-(--sj-text-muted)">
                                            No active emergency dispatches in progress. System is standing by.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Capacity Overview */}
                            <Link
                                to="/dashboard/hospital/capacity"
                                className="sj-card group block p-5 transition hover:border-(--sj-primary)/30 hover:shadow-lg"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-black text-(--sj-text)">
                                            Hospital capacity
                                        </p>
                                        <p className="mt-1 text-xs text-(--sj-text-muted)">
                                            Current availability
                                        </p>
                                    </div>
                                    <Bed className="h-5 w-5 text-(--sj-primary)" />
                                </div>

                                <div className="mt-6 space-y-5">
                                    {CAPACITY.map((item) => {
                                        const percentage = Math.round(
                                            (item.available / item.total) * 100
                                        );

                                        return (
                                            <div key={item.label}>
                                                <div className="mb-2 flex items-center justify-between">
                                                    <span className="text-xs font-bold text-(--sj-text-soft)">
                                                        {item.label}
                                                    </span>
                                                    <span className="text-xs font-black text-(--sj-text)">
                                                        {item.available}/{item.total}
                                                    </span>
                                                </div>

                                                <div className="h-2 overflow-hidden rounded-full bg-(--sj-surface-2)">
                                                    <div
                                                        className="h-full rounded-full bg-(--sj-primary)"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-6 flex items-center justify-between border-t border-(--sj-border) pt-4">
                                    <span className="text-xs font-black text-(--sj-text-muted)">
                                        Manage capacity
                                    </span>
                                    <ChevronRight className="h-4 w-4 text-(--sj-text-muted) transition group-hover:translate-x-0.5 group-hover:text-(--sj-primary)" />
                                </div>
                            </Link>
                        </section>

                        {/* Ambulances & Activity Grid */}
                        <section className="mt-6 grid gap-6 xl:grid-cols-2">
                            {/* Ambulances */}
                            <Link
                                to="/dashboard/hospital/ambulances"
                                className="sj-card group block overflow-hidden transition hover:border-(--sj-primary)/30 hover:shadow-lg"
                            >
                                <div className="flex items-center justify-between border-b border-(--sj-border) px-5 py-4">
                                    <div>
                                        <p className="text-sm font-black text-(--sj-text)">
                                            Ambulance fleet
                                        </p>
                                        <p className="mt-1 text-xs text-(--sj-text-muted)">
                                            Current ambulance operations
                                        </p>
                                    </div>
                                    <span className="text-xs font-black text-(--sj-primary)">
                                        Manage
                                    </span>
                                </div>

                                <div className="divide-y divide-(--sj-border)">
                                    {MOCK_AMBULANCES.map((ambulance) => (
                                        <div
                                            key={ambulance.id}
                                            className="flex items-center gap-4 px-5 py-4"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--sj-primary)/10 text-(--sj-primary)">
                                                <Ambulance className="h-5 w-5" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-black text-(--sj-text)">
                                                        {ambulance.id}
                                                    </p>
                                                    <span className="rounded-md bg-(--sj-surface-2) px-1.5 py-0.5 text-[9px] font-black text-(--sj-text-muted)">
                                                        {ambulance.type}
                                                    </span>
                                                </div>

                                                <p className="mt-1 text-xs text-(--sj-text-muted)">
                                                    {ambulance.driver} · {ambulance.location}
                                                </p>
                                            </div>

                                            <StatusBadge
                                                tone={ambulance.status === 'Available' ? 'success' : 'warning'}
                                            >
                                                {ambulance.status}
                                            </StatusBadge>
                                        </div>
                                    ))}
                                </div>
                            </Link>

                            {/* Activity */}
                            <div className="sj-card overflow-hidden">
                                <div className="flex items-center justify-between border-b border-(--sj-border) px-5 py-4">
                                    <div>
                                        <p className="text-sm font-black text-(--sj-text)">
                                            Recent activity
                                        </p>
                                        <p className="mt-1 text-xs text-(--sj-text-muted)">
                                            Latest operational events
                                        </p>
                                    </div>
                                    <MoreHorizontal className="h-5 w-5 text-(--sj-text-muted)" />
                                </div>

                                <div className="divide-y divide-(--sj-border)">
                                    {MOCK_ACTIVITY.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <div
                                                key={`${item.title}-${item.time}`}
                                                className="flex gap-3 px-5 py-4"
                                            >
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--sj-surface-2) text-(--sj-text-soft)">
                                                    <Icon className="h-4 w-4" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-black text-(--sj-text)">
                                                        {item.title}
                                                    </p>
                                                    <p className="mt-1 text-[11px] leading-5 text-(--sj-text-muted)">
                                                        {item.description}
                                                    </p>
                                                    <p className="mt-1 text-[10px] font-bold text-(--sj-text-muted)">
                                                        {item.time}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right-Hand Sidebar */}
                    <aside className="space-y-6">
                        {/* Hospital Profile */}
                        <div className="sj-card overflow-hidden">
                            <div className="border-b border-(--sj-border) bg-(--sj-primary)/5 p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--sj-primary)/10 text-(--sj-primary)">
                                        <Hospital className="h-5 w-5" />
                                    </div>
                                    <StatusBadge tone="success">
                                        {MOCK_HOSPITAL.status}
                                    </StatusBadge>
                                </div>

                                <h2 className="mt-4 text-lg font-black tracking-tight text-(--sj-text)">
                                    {MOCK_HOSPITAL.name}
                                </h2>
                                <p className="mt-1 text-xs text-(--sj-text-muted)">
                                    {MOCK_HOSPITAL.type}
                                </p>
                                <div className="mt-3 flex items-center gap-1.5 text-xs text-(--sj-text-soft)">
                                    <MapPin className="h-3.5 w-3.5 text-(--sj-primary)" />
                                    {MOCK_HOSPITAL.city}, {MOCK_HOSPITAL.state}
                                </div>
                            </div>
                        </div>

                        {/* Registered Capabilities */}
                        <div className="sj-card p-5">
                            <p className="text-sm font-black text-(--sj-text)">
                                Emergency capabilities
                            </p>
                            <p className="mt-1 text-xs text-(--sj-text-muted)">
                                Registered trauma specialties
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {SERVICES.map((service) => (
                                    <span
                                        key={service}
                                        className="rounded-lg border border-(--sj-border) bg-(--sj-surface-2) px-2.5 py-1.5 text-[10px] font-bold text-(--sj-text-soft)"
                                    >
                                        {service}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Helpline */}
                        <div className="sj-card p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-(--sj-text)">
                                        Emergency line
                                    </p>
                                    <p className="mt-1 text-xs text-(--sj-text-muted)">
                                        Trauma intake desk
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 rounded-xl bg-(--sj-surface-2) p-3">
                                <p className="text-sm font-black text-(--sj-text)">
                                    +91 11 4000 1122
                                </p>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}

export default HospitalDashboard;