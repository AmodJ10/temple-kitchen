import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNav from './BottomNav';

const AppLayout = () => {
    return (
        <div className="flex min-h-screen bg-[var(--color-bg-primary)]">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Topbar />
                <main className="flex-1 pb-20 md:pb-0 overflow-x-hidden">
                    <Outlet />
                </main>
                <BottomNav />
            </div>
        </div>
    );
};

export default AppLayout;
