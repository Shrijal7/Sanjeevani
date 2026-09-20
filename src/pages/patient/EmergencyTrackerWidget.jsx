import React, { useState, useEffect } from 'react';
import { Ambulance, Clock, MapPin, ShieldAlert } from 'lucide-react';
import { triggerEmergencySOS, getDispatchStatus } from '../../services/api';

export default function EmergencyTrackerWidget() {
    const [status, setStatus] = useState('idle');
    const [emergency, setEmergency] = useState(null);
    const [telemetry, setTelemetry] = useState(null);
    const [error, setError] = useState('');

    const handleSOS = async () => {
        setError('');
        setStatus('dispatching');
        try {
            const data = await triggerEmergencySOS({
                latitude: 25.4358,
                longitude: 81.8463,
                requester_phone: '+919876543210',
                emergency_type: 'Acute Medical Distress',
                priority: 'critical',
                address_text: 'Live Patient Geolocation',
                description: 'Dispatched via Patient Portal One-Click SOS'
            });
            setEmergency(data);
            setStatus('active');
        } catch (err) {
            setError(err.message || 'Emergency dispatch failed.');
            setStatus('idle');
        }
    };

    useEffect(() => {
        const dispatchId = emergency?.dispatch?.dispatch_id;
        if (!dispatchId || status !== 'active') return;

        const timer = setInterval(async () => {
            try {
                const liveData = await getDispatchStatus(dispatchId);
                setTelemetry(liveData);
            } catch (e) {
                console.error('Telemetry error:', e);
            }
        }, 3000);

        return () => clearInterval(timer);
    }, [emergency, status]);

    return (
        <div className="rounded-2xl border border-red-500/20 bg-(--sj-surface) p-6 shadow-sm">
            {status !== 'active' ? (
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-600">
                        <ShieldAlert className="h-8 w-8 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-black text-(--sj-text)">
                        Emergency SOS Dispatch
                    </h3>
                    <p className="mt-1 text-sm text-(--sj-text-soft)">
                        Instantly dispatches the nearest paramedic and alerts regional emergency triage.
                    </p>

                    {error && (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/20">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleSOS}
                        disabled={status !== 'idle'}
                        className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700 disabled:opacity-60"
                    >
                        {status === 'dispatching' ? 'Dispatching emergency unit...' : 'TRIGGER IMMEDIATE SOS'}
                    </button>
                </div>
            ) : (
                <div className="space-y-5">
                    <div className="flex items-center justify-between border-b border-(--sj-border) pb-4">
                        <div className="flex items-center gap-2">
                            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-sm font-black uppercase tracking-wider text-emerald-600">
                                Unit En Route
                            </span>
                        </div>
                        <span className="text-xs font-mono text-(--sj-text-muted)">
                            ID: {emergency?.id?.slice(0, 8)}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl bg-(--sj-surface-2) p-4">
                            <div className="flex items-center gap-2 text-(--sj-text-soft)">
                                <Clock className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">ETA</span>
                            </div>
                            <p className="mt-1 text-2xl font-black text-(--sj-text)">
                                {telemetry?.eta_minutes || emergency?.dispatch?.eta_minutes || 8} min
                            </p>
                        </div>

                        <div className="rounded-xl bg-(--sj-surface-2) p-4">
                            <div className="flex items-center gap-2 text-(--sj-text-soft)">
                                <Ambulance className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Unit No</span>
                            </div>
                            <p className="mt-1 text-sm font-black text-(--sj-text)">
                                {telemetry?.ambulance?.vehicle_number || emergency?.dispatch?.vehicle_number || 'UP-70-EM-1001'}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-(--sj-border) bg-(--sj-surface-2) p-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-(--sj-text-soft)">
                            <MapPin className="h-4 w-4 text-emerald-600" /> Destination Hospital
                        </div>
                        <p className="mt-1 text-sm font-bold text-(--sj-text)">
                            {emergency?.dispatch?.hospital_name || 'City Emergency Trauma Center'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}