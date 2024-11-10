import MainLayout from '@/app/(layouts)/MainLayout';
import React from 'react';

const Home = () => {
    return (
        <div className='flex justify-center items-center h-screen'>
            <div>
                <div className='text-center'>
                    <h1 className='text-5xl'>Serving Bangladesh for 30+ years</h1>
                    <h3 className='text-3xl pt-16 pb-5'>Login</h3>
                </div>
                <form action="" className='border p-8 rounded-md w-1/2 mx-auto'>
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="">Username</label>
                        <input type="text" className="input p-1 border w-full" />
                    </div>
                    <div className='flex flex-col gap-1 mt-3'>
                        <label htmlFor="">Password</label>
                        <input type="password" className="input p-1 border w-full" />
                    </div>
                    <div className='text-center mt-5'>
                        <button className='border py-1 px-3 rounded-md'>Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

Home.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Home;