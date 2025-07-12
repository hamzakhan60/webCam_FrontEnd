import React from "react";
import { useNavigate } from 'react-router-dom';
const Login = () => {
      const navigate = useNavigate();
  return (
    <div className="min-h-screen font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 shadow-sm bg-white">
        <div className="text-2xl font-bold">Logo</div>
        <div className="flex items-center gap-6 text-sm">
          <button onClick={() => navigate('/auth')} className="px-4 py-1 border rounded hover:bg-gray-100">Login</button>
          <button  onClick={() => navigate('/auth')} className="px-4 py-1 bg-black text-white rounded hover:bg-gray-800">Sign Up</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 px-8 py-20 bg-white items-center">
        <div className="space-y-6">
          <h1 className="text-6xl font-bold leading-tight">
            Join Effortless Video <br /> Meetings with Face Recognition
          </h1>
          <p className="text-gray-600 max-w-lg  p-3">
            Experience seamless communication with our cutting-edge video meeting platform. 
            Enjoy enhanced security and convenience through face authentication technology.
          </p>
          <div className="flex gap-4">
            <button className="bg-black text-white px-5 py-2 rounded hover:bg-gray-800">Get Started</button>
            <button className="border px-5 py-2 rounded hover:bg-gray-100">Learn More</button>
          </div>
        </div>

        {/* Image Placeholder */}
        <div className="mt-10 md:mt-0 flex justify-center">
          <div className="bg-gray-200 w-full h-full flex items-center justify-center rounded-md">
            <img src="https://i.insider.com/5ea999b64bca630ae6223008?width=700" alt="Placeholder" className="rounded-md shadow-lg w-full h-full" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
