import MainLayout from '@/app/(layouts)/MainLayout';
import React from 'react';

const Home = () => {
    return (
        <div>
            this is homepage
        </div>
    );
};

Home.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Home;