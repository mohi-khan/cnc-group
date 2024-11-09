import React from 'react';
import Sidebar from '../(components)/Sidebar';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <Sidebar />
            <main>{children}</main>
        </div>
    );
};

export default DashboardLayout;
