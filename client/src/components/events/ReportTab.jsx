import { lazy, Suspense, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
    dishAPI,
    procurementAPI,
    attendanceAPI,
    inventoryUsedAPI,
    meetingAPI,
    taskAPI,
} from '../../api/endpoints';
import Card from '../ui/Card';

const ReportPdfSurface = lazy(() => import('./ReportPdfSurface'));

const ReportLoadingState = ({ label = 'Compiling Report...' }) => (
    <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-[var(--color-text-muted)]">
            <Loader2 size={40} className="animate-spin mb-4 text-[var(--color-primary)]" />
            <p className="font-medium text-lg">{label}</p>
            <p className="text-sm mt-1">Gathering event data across all sections</p>
        </div>
    </Card>
);

const ReportTab = ({ event }) => {
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [dishesRes, procRes, attRes, invRes, meetRes, taskRes] = await Promise.all([
                    dishAPI.getByEvent(event._id),
                    procurementAPI.getByEvent(event._id),
                    attendanceAPI.getByEvent(event._id),
                    inventoryUsedAPI.getByEvent(event._id),
                    meetingAPI.getByEvent(event._id),
                    taskAPI.getByEvent(event._id),
                ]);

                setReportData({
                    dishes: dishesRes.data.data || [],
                    procurements: procRes.data.data || [],
                    attendance: attRes.data.data || [],
                    inventory: invRes.data.data || [],
                    meetings: meetRes.data.data || [],
                    tasks: taskRes.data.data || [],
                });
            } catch (error) {
                console.error('Failed to load report data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [event._id]);

    if (loading || !reportData) {
        return <ReportLoadingState />;
    }

    return (
        <Suspense fallback={<ReportLoadingState label="Loading PDF renderer..." />}>
            <ReportPdfSurface event={event} reportData={reportData} />
        </Suspense>
    );
};

export default ReportTab;
