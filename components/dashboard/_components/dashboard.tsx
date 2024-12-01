"use client";

import { useEffect, useState } from 'react';

interface User {
  userId: number;
  username: string;
  roleId: number;
  roleName: string;
  // Add other user properties as needed
}

const Dashboard = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            const userData = JSON.parse(userStr);
            setUser(userData);
            console.log('Current user from localStorage:', userData);
        } else {
            console.log('No user data found in localStorage');
        }
    }, []);

    return (
        <div>
            <h1>Welcome to dashboard page</h1>
            {user && (
                <div>
                    <p>Logged in as: {user.username}</p>
                    <p>Role: {user.roleName}</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

