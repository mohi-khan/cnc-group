import MainLayout from '@/app/(layouts)/MainLayout';
import React from 'react';

const CreateUser = () => {
    return (
        <div className='flex justify-center items-center pt-10'>
            <div>
                <div className='text-center'>
                    <h1 className='text-5xl'>Serving Bangladesh for 30+ years</h1>
                    <h3 className='text-3xl pt-16 pb-5'>Create User</h3>
                </div>
                <form action="" className='border p-8 rounded-md w-1/2 mx-auto'>
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="">Username</label>
                        <input type="text" className="input p-1 border w-full" />
                    </div>
                    <div className='flex flex-col gap-1 mt-3'>
                        <label htmlFor="">Initial Password</label>
                        <input type="password" className="input p-1 border w-full" />
                    </div>
                    <div className='flex flex-col gap-1 mt-3'>
                        <label htmlFor="">Re-type Password</label>
                        <input type="password" className="input p-1 border w-full" />
                    </div>
                    <div className='flex flex-col gap-1 mt-3'>
                        <label htmlFor="">Select Role</label>
                        <select name="" id="" className="p-2 border w-full">
                            <option value="" disabled>Select option</option>
                            <option value="Admin">admin</option>
                            <option value="Entry Operation">Entry Operation</option>
                            <option value="Supervisor">Supervisor</option>
                            <option value="Management">Management</option>
                        </select>
                    </div>
                    <div className='flex flex-col gap-1 mt-3'>
                        <label htmlFor="">Company</label>
                        <div className='grid grid-cols-2'>
                            <div className='flex items-center gap-2'>
                                <input type="checkbox" className="border" />
                                <p>Company</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <input type="checkbox" className="border" />
                                <p>Company</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <input type="checkbox" className="border" />
                                <p>Company</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <input type="checkbox" className="border" />
                                <p>Company</p>
                            </div>
                        </div>
                        <div className='text-right'>
                            <button className='border text-sm px-2 rounded-md'>New</button>
                        </div>
                    </div>
                    <div className='flex flex-col gap-1 mt-3'>
                        <label htmlFor="">Location</label>
                        <div className='grid grid-cols-2'>
                            <div className='flex items-center gap-2'>
                                <input type="checkbox" className="border" />
                                <p>Location</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <input type="checkbox" className="border" />
                                <p>Location</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <input type="checkbox" className="border" />
                                <p>Location</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <input type="checkbox" className="border" />
                                <p>Location</p>
                            </div>
                        </div>
                        <div className='text-right'>
                            <button className='border text-sm px-2 rounded-md'>New</button>
                        </div>
                    </div>
                    <div className='flex flex-col gap-1 mt-3'>
                        <label htmlFor="">Voucher</label>
                        <div className='grid grid-cols-2'>
                            <div className='flex items-center gap-2'>
                                <input type="checkbox" className="border" />
                                <p>Voucher</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <input type="checkbox" className="border" />
                                <p>Voucher</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <input type="checkbox" className="border" />
                                <p>Voucher</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <input type="checkbox" className="border" />
                                <p>Voucher</p>
                            </div>
                        </div>                        
                    </div>
                    <div className='text-center mt-5'>
                        <button className='border py-1 px-3 rounded-md'>Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

CreateUser.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default CreateUser;