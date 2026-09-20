import React, { useState, useEffect } from 'react';
import {
    Activity,
    Ambulance,
    ArrowUpRight,
    CheckCircle2,
    Clock3,
    HeartPulse,
    Hospital,
    MapPin,
    Navigation,
    Phone,
    Radio,
    Send,
    ShieldCheck,
    Siren,
    Stethoscope,
    Wifi,
    WifiOff,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import ParamedicNavbar from '../../components/layout/ParamedicNavbar';
import { streamParamedicVitals, getHospitalEmergencies } from '../../services/api';

const MOCK_PARAMEDIC = {
    name: 'Rohan Mehta',
    qualification: 'Emergency Medical Technician',
    hospital: 'Sanjeevani Emergency Hospital',
    ambulanceId: 'AMB-042',
    ambulanceType: 'ALS Ambulance',
};

const DEFAULT_MISSION = {
    id: 'EM-2026-00131',
    severity: 'CRITICAL',
    patient: 'Emergency patient',
    incidentArea: 'Civil Lines',
    incidentCity: 'Prayagraj',
    distanceToPatient: '2.4 km',
    etaToPatient: '6 min',
    destination: 'Sanjeevani Emergency Hospital',
    hospitalDistance: '5.8 km',
    hospitalEta: '12 min',
    status: 'EN_ROUTE_TO_HOSPITAL',
};

const MOCK_STATS = {
    completedToday: 3,
    completedMonth: 47,
    responseTime: '8.4 min',
};

function getSeverityClasses(severity) {
    if (String(severity).toUpperCase() === 'CRITICAL') {
        return 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400';
    }
    if (String(severity).toUpperCase() === 'HIGH') {
        return 'border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400';
    }
    return 'border-(--sj-border) bg-(--sj-surface-2) text-(--sj-text-soft)';
}

export default function ParamedicDashboard() {
    const navigate = useNavigate();

    const [isOnline, setIsOnline] = useState(true);
    const [showContactMessage, setShowContactMessage] = useState(false);

    // Active Mission & Telemetry state
    const [dispatchId, setDispatchId] = useState('');
    const [activeMission, setActiveMission] = useState(DEFAULT_MISSION);
    const [spo2, setSpo2] = useState('98');
    const [heartRate, setHeartRate] = useState('78');
    const [bloodPressure, setBloodPressure] = useState('120/80');
    const [syncingVitals, setSyncingVitals] = useState(false);
    const [syncSuccess, setSyncSuccess] = useState(false);
    const [syncError, setSyncError] = useState('');

    useEffect(() => {
        const syncActiveMission = async () => {
            try {
                const queue = await getHospitalEmergencies();
                if (Array.isArray(queue) && queue.length > 0) {
                    const latest = queue[0];
                    setDispatchId(latest.id);
                    setActiveMission((prev) => ({
                        ...prev,
                        id: latest.id,
                        severity: latest.priority || 'CRITICAL',
                        incidentArea: latest.address_text || 'Live Patient Geolocation',
                    }));
                }
            } catch (err) {
                console.warn('Could not auto-fetch active mission:', err);
            }
        };
        syncActiveMission();
    }, []);

    const handleContactHospital = () => {
        setShowContactMessage(true);
        window.setTimeout(() => setShowContactMessage(false), 2500);
    };

    const handleBroadcastVitals = async (e) => {
        e.preventDefault();
        setSyncError('');
        setSyncSuccess(false);

        const targetId = dispatchId.trim() || activeMission.id;
        setSyncingVitals(true);

        try {
            await streamParamedicVitals(targetId, {
                latitude: 25.4385,
                longitude: 81.8492,
                patient_vitals: {
                    spo2: Number(spo2),
                    bpm: Number(heartRate),
                    bp: bloodPressure,
                },
            });
            setSyncSuccess(true);
            setTimeout(() => setSyncSuccess(false), 3500);
        } catch (err) {
            setSyncError(err.message || 'Failed to sync telemetry to hospital');
        } finally {
            setSyncingVitals(false);
        }
    };

    return (
        <div className="sanjeevani-page min-h-screen">
            <ParamedicNavbar />

            <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                {/* Header */}
                <section className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-(--sj-primary)">
                            <Stethoscope size={15} />
                            Paramedic command center
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-(--sj-text) sm:text-3xl">
                            Good morning, {MOCK_PARAMEDIC.name.split(' ')[0]}
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-(--sj-text-soft)">
                            Monitor your ambulance, broadcast vital signs in real time, and coordinate triage handoffs.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div
                            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${
                                isOnline
                                    ? 'border-(--sj-primary)/30 bg-(--sj-primary-soft) text-(--sj-primary)'
                                    : 'border-red-500/30 bg-red-500/10 text-red-500'
                            }`}
                        >
                            {isOnline ? <Wifi size={17} /> : <WifiOff size={17} />}
                            {isOnline ? 'Available for missions' : 'Offline'}
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsOnline((current) => !current)}
                            className="rounded-xl border border-(--sj-border) bg-(--sj-surface) px-4 py-2.5 text-sm font-semibold text-(--sj-text-soft) transition hover:bg-(--sj-surface-2) hover:text-(--sj-text)"
                        >
                            {isOnline ? 'Go offline' : 'Go online'}
                        </button>
                    </div>
                </section>

                {/* Top Metrics Cards */}
                <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="sj-card p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-(--sj-text-muted)">Ambulance</p>
                                <p className="mt-2 text-xl font-bold text-(--sj-text)">{MOCK_PARAMEDIC.ambulanceId}</p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--sj-primary-soft) text-(--sj-primary)">
                                <Ambulance size={19} />
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-(--sj-text-soft)">{MOCK_PARAMEDIC.ambulanceType}</p>
                    </div>

                    <div className="sj-card p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-(--sj-text-muted)">Missions today</p>
                                <p className="mt-2 text-xl font-bold text-(--sj-text)">{MOCK_STATS.completedToday}</p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--sj-primary-soft) text-(--sj-primary)">
                                <CheckCircle2 size={19} />
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-(--sj-text-soft)">Successfully completed</p>
                    </div>

                    <div className="sj-card p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-(--sj-text-muted)">Monthly missions</p>
                                <p className="mt-2 text-xl font-bold text-(--sj-text)">{MOCK_STATS.completedMonth}</p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--sj-primary-soft) text-(--sj-primary)">
                                <Siren size={19} />
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-(--sj-text-soft)">Current operational cycle</p>
                    </div>

                    <div className="sj-card p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-(--sj-text-muted)">Avg. response time</p>
                                <p className="mt-2 text-xl font-bold text-(--sj-text)">{MOCK_STATS.responseTime}</p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--sj-primary-soft) text-(--sj-primary)">
                                <Clock3 size={19} />
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-(--sj-text-soft)">Trauma corridor compliant</p>
                    </div>
                </section>

                {/* Main Action Grid */}
                <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                    <div className="space-y-6">
                        {/* Active Mission Card */}
                        <div className="sj-card overflow-hidden">
                            <div className="flex flex-col gap-4 border-b border-(--sj-border) p-5 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="sj-live-dot" />
                                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-(--sj-primary)">
                                            Active mission
                                        </span>
                                    </div>

                                    <h2 className="mt-2 text-lg font-bold text-(--sj-text)">
                                        Emergency Transit Assigned
                                    </h2>
                                </div>

                                <span
                                    className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-bold ${getSeverityClasses(
                                        activeMission.severity,
                                    )}`}
                                >
                                    {activeMission.severity}
                                </span>
                            </div>

                            <div className="grid gap-5 p-5 lg:grid-cols-[1fr_280px]">
                                <div>
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                                            <Siren size={21} />
                                        </div>

                                        <div>
                                            <p className="text-xs text-(--sj-text-muted)">Active Incident Reference</p>
                                            <p className="text-sm font-bold font-mono text-(--sj-text)">
                                                {activeMission.id}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--sj-primary-soft) text-(--sj-primary)">
                                                <MapPin size={17} />
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium text-(--sj-text-muted)">Patient pickup</p>
                                                <p className="mt-1 text-sm font-semibold text-(--sj-text)">{activeMission.incidentArea}</p>
                                                <p className="mt-1 text-xs text-(--sj-text-soft)">{activeMission.incidentCity}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--sj-primary-soft) text-(--sj-primary)">
                                                <Hospital size={17} />
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium text-(--sj-text-muted)">Destination hospital</p>
                                                <p className="mt-1 text-sm font-semibold text-(--sj-text)">{activeMission.destination}</p>
                                                <p className="mt-1 text-xs text-(--sj-text-soft)">
                                                    {activeMission.hospitalDistance} · {activeMission.hospitalEta}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-xl bg-(--sj-surface-2) p-4">
                                            <p className="text-xs text-(--sj-text-muted)">Distance to patient</p>
                                            <p className="mt-1 text-lg font-bold text-(--sj-text)">{activeMission.distanceToPatient}</p>
                                        </div>

                                        <div className="rounded-xl bg-(--sj-surface-2) p-4">
                                            <p className="text-xs text-(--sj-text-muted)">Estimated arrival</p>
                                            <p className="mt-1 text-lg font-bold text-(--sj-primary)">{activeMission.etaToPatient}</p>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/dashboard/paramedic/emergency/${activeMission.id}`)}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-(--sj-primary) px-4 py-3 text-sm font-semibold text-white transition hover:bg-(--sj-primary-dark)"
                                        >
                                            Open emergency
                                            <ArrowUpRight size={17} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => navigate(`/dashboard/paramedic/navigation/${activeMission.id}`)}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-(--sj-border) bg-(--sj-surface) px-4 py-3 text-sm font-semibold text-(--sj-text) transition hover:bg-(--sj-surface-2)"
                                        >
                                            <Navigation size={17} />
                                            Start navigation
                                        </button>
                                    </div>
                                </div>

                                <div className="sj-map min-h-65 overflow-hidden rounded-2xl">
                                    <div className="sj-map-grid h-full min-h-65 p-5">
                                        <div className="relative flex h-full items-center justify-center">
                                            <div className="absolute h-40 w-40 rounded-full border border-(--sj-primary)/20" />
                                            <div className="absolute h-24 w-24 rounded-full border border-(--sj-primary)/30" />

                                            <div className="absolute left-[22%] top-[26%] flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-lg">
                                                <MapPin size={19} />
                                            </div>

                                            <div className="absolute right-[18%] bottom-[24%] flex h-10 w-10 items-center justify-center rounded-full bg-(--sj-primary) text-white shadow-lg">
                                                <Ambulance size={19} />
                                            </div>

                                            <div className="absolute left-[28%] top-[36%] h-0.5 w-[48%] rotate-18 bg-(--sj-primary) opacity-60" />

                                            <div className="absolute bottom-4 left-4 rounded-lg border border-(--sj-border) bg-(--sj-surface)/90 px-3 py-2 backdrop-blur">
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-(--sj-text-muted)">
                                                    Live route
                                                </p>
                                                <p className="mt-1 text-xs font-bold text-(--sj-text)">
                                                    Corridor Cleared
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Real-time In-Transit Biometrics Telemetry Form */}
                        <div className="sj-card p-5">
                            <div className="mb-4 flex items-center justify-between border-b border-(--sj-border) pb-3">
                                <div className="flex items-center gap-2">
                                    <HeartPulse className="h-5 w-5 text-red-500 animate-pulse" />
                                    <h3 className="text-base font-bold text-(--sj-text)">In-Transit Patient Telemetry</h3>
                                </div>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                                    <Radio className="h-3 w-3 animate-pulse" /> Live Hospital Link
                                </span>
                            </div>

                            <form onSubmit={handleBroadcastVitals} className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-4">
                                    <div>
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-(--sj-text-muted)">
                                            Target ID / UUID
                                        </label>
                                        <input
                                            type="text"
                                            value={dispatchId}
                                            onChange={(e) => setDispatchId(e.target.value)}
                                            className="sj-input mt-1 h-11 text-xs font-mono"
                                            placeholder="Incident/Dispatch UUID"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-(--sj-text-muted)">
                                            SPO2 (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={spo2}
                                            onChange={(e) => setSpo2(e.target.value)}
                                            className="sj-input mt-1 h-11 text-center font-bold"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-(--sj-text-muted)">
                                            Heart Rate (BPM)
                                        </label>
                                        <input
                                            type="number"
                                            value={heartRate}
                                            onChange={(e) => setHeartRate(e.target.value)}
                                            className="sj-input mt-1 h-11 text-center font-bold"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-(--sj-text-muted)">
                                            BP (mmHg)
                                        </label>
                                        <input
                                            type="text"
                                            value={bloodPressure}
                                            onChange={(e) => setBloodPressure(e.target.value)}
                                            className="sj-input mt-1 h-11 text-center font-bold"
                                            placeholder="120/80"
                                            required
                                        />
                                    </div>
                                </div>

                                {syncSuccess && (
                                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-center text-xs font-bold text-emerald-600">
                                        ✓ Biometric telemetry updated and streamed to trauma intake!
                                    </div>
                                )}

                                {syncError && (
                                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 text-center text-xs font-bold text-red-600">
                                        {syncError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={syncingVitals}
                                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-(--sj-primary) text-xs font-bold text-white shadow-sm transition hover:bg-(--sj-primary-dark) disabled:opacity-50"
                                >
                                    <Send size={15} />
                                    {syncingVitals ? 'Transmitting to Hospital...' : 'Transmit Telemetry to Hospital'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right-Hand Sidebar */}
                    <div className="space-y-6">
                        <div className="sj-card p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-(--sj-primary)">
                                        Your ambulance
                                    </p>
                                    <h2 className="mt-2 text-lg font-bold text-(--sj-text)">
                                        {MOCK_PARAMEDIC.ambulanceId}
                                    </h2>
                                </div>

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--sj-primary-soft) text-(--sj-primary)">
                                    <Ambulance size={21} />
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                <div className="flex items-center justify-between rounded-xl bg-(--sj-surface-2) px-4 py-3">
                                    <span className="text-xs text-(--sj-text-soft)">Type</span>
                                    <span className="text-xs font-semibold text-(--sj-text)">{MOCK_PARAMEDIC.ambulanceType}</span>
                                </div>

                                <div className="flex items-center justify-between rounded-xl bg-(--sj-surface-2) px-4 py-3">
                                    <span className="text-xs text-(--sj-text-soft)">Status</span>
                                    <span className="flex items-center gap-2 text-xs font-semibold text-(--sj-primary)">
                                        <span className="h-2 w-2 rounded-full bg-(--sj-primary)" />
                                        Operational
                                    </span>
                                </div>

                                <div className="flex items-center justify-between rounded-xl bg-(--sj-surface-2) px-4 py-3">
                                    <span className="text-xs text-(--sj-text-soft)">Hospital</span>
                                    <span className="max-w-40 truncate text-xs font-semibold text-(--sj-text)">{MOCK_PARAMEDIC.hospital}</span>
                                </div>
                            </div>
                        </div>

                        {/* Mission Readiness */}
                        <div className="sj-card p-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--sj-primary-soft) text-(--sj-primary)">
                                    <ShieldCheck size={19} />
                                </div>

                                <div>
                                    <h2 className="text-sm font-bold text-(--sj-text)">Mission readiness</h2>
                                    <p className="mt-1 text-xs text-(--sj-text-soft)">Keep these enabled while on duty.</p>
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 size={17} className="text-(--sj-primary)" />
                                    <span className="text-xs text-(--sj-text-soft)">Location telemetry live</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <CheckCircle2 size={17} className="text-(--sj-primary)" />
                                    <span className="text-xs text-(--sj-text-soft)">Hospital link synchronized</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <CheckCircle2 size={17} className="text-(--sj-primary)" />
                                    <span className="text-xs text-(--sj-text-soft)">Emergency notifications active</span>
                                </div>
                            </div>
                        </div>

                        {/* Hospital Coordination Contact */}
                        <div className="sj-card p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--sj-primary-soft) text-(--sj-primary)">
                                    <Phone size={18} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h2 className="text-sm font-bold text-(--sj-text)">Hospital coordination</h2>
                                    <p className="mt-1 text-xs leading-5 text-(--sj-text-soft)">
                                        Direct hotline to the triage desk for trauma bed reservations.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={handleContactHospital}
                                        className="mt-3 text-xs font-semibold text-(--sj-primary) hover:text-(--sj-primary-dark)"
                                    >
                                        Contact coordination team
                                    </button>

                                    {showContactMessage && (
                                        <p className="mt-2 text-xs font-medium text-(--sj-primary)">
                                            Triage bridge line dialed (+91 11 4000 1122).
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}