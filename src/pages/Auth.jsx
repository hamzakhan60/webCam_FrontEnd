import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
    const navigate = useNavigate();
  // Main toggle state
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Form data state
  const [formData, setFormData] = useState({
    signInEmail: '',
    signInPassword: '',
    signUpName: '',
    signUpEmail: '',
    signUpPassword: ''
  });

  // Handle all input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear previous error/success messages when user types
    setError(null);
    setSuccess(null);
  };
  
  // Handle sign in form submission
  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.signInEmail,
          password: formData.signInPassword
        }),
      });
      
      const data = await response.json();
      console.log('Sign in response:', data);
      // ✅ Save to localStorage
        localStorage.setItem('user', JSON.stringify(data));
      
      if (!response.ok) {
        throw new Error(data.message || 'Sign in failed');
      }
      
      setSuccess('Sign in successful!');
      // Handle successful login (e.g., store token, redirect)
      console.log('Sign in successful:', data);
      navigate('/focus-meet');
      // Reset form
      setFormData(prev => ({
        ...prev,
        signInEmail: '',
        signInPassword: ''
      }));
      
    } catch (err) {
      setError(err.message || 'Something went wrong during sign in');
      console.error('Sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle sign up form submission
  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('http://localhost:5000/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.signUpName,
          email: formData.signUpEmail,
          password: formData.signUpPassword
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Sign up failed');
      }
      
      setSuccess('Account created successfully!');
      // Handle successful registration
      console.log('Sign up successful:', data);
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        signUpName: '',
        signUpEmail: '',
        signUpPassword: ''
      }));
      
    } catch (err) {
      setError(err.message || 'Something went wrong during sign up');
      console.error('Sign up error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-3xl h-[480px] mx-auto my-12 overflow-hidden bg-white shadow-lg">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md">Loading...</div>
        </div>
      )}
      
      {/* Status message */}
      {(error || success) && (
        <div className={`absolute top-2 left-0 right-0 mx-auto w-3/4 p-2 rounded text-center z-50 ${
          error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {error || success}
        </div>
      )}

      {/* Sign In Form */}
      <form 
        onSubmit={handleSignIn}
        className={`absolute top-0 left-0 w-1/2 h-full bg-white p-8 flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${
          isSignUp ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'
        }`}
      >
        <h2 className="text-2xl font-bold mb-6">Sign In</h2>
        <input
          type="email"
          name="signInEmail"
          placeholder="Email"
          value={formData.signInEmail}
          onChange={handleInputChange}
          className="w-full p-3 mb-4 border border-gray-300 rounded"
          required
        />
        <input
          type="password"
          name="signInPassword"
          placeholder="Password"
          value={formData.signInPassword}
          onChange={handleInputChange}
          className="w-full p-3 mb-6 border border-gray-300 rounded"
          required
        />
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full py-3 border border-black rounded hover:bg-black hover:text-white transition-colors"
        >
          SIGN IN
        </button>
      </form>

      {/* Sign Up Form */}
      <form 
        onSubmit={handleSignUp}
        className={`absolute top-0 right-0 w-1/2 h-full bg-white p-8 flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${
          isSignUp ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
      >
        <h2 className="text-2xl font-bold mb-6">Create Account</h2>
        <div className="flex justify-center gap-4 mb-4">
          <button type="button" className="w-10 h-10 flex items-center justify-center border border-black rounded-full">F</button>
          <button type="button" className="w-10 h-10 flex items-center justify-center border border-black rounded-full">G</button>
          <button type="button" className="w-10 h-10 flex items-center justify-center border border-black rounded-full">in</button>
        </div>
        <p className="text-sm mb-4">or use your email for registration</p>
        <input
          type="text"
          name="signUpName"
          placeholder="Name"
          value={formData.signUpName}
          onChange={handleInputChange}
          className="w-full p-3 mb-3 border border-gray-300 rounded"
          required
        />
        <input
          type="email"
          name="signUpEmail"
          placeholder="Email"
          value={formData.signUpEmail}
          onChange={handleInputChange}
          className="w-full p-3 mb-3 border border-gray-300 rounded"
          required
        />
        <input
          type="password"
          name="signUpPassword"
          placeholder="Password"
          value={formData.signUpPassword}
          onChange={handleInputChange}
          className="w-full p-3 mb-5 border border-gray-300 rounded"
          required
        />
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors"
        >
          SIGN UP
        </button>
      </form>

      {/* Overlay */}
      <div 
        className={`absolute top-0 h-full w-1/2 bg-black text-white transition-transform duration-500 ease-in-out ${
          isSignUp ? 'left-0' : 'left-1/2'
        }`}
      >
        {/* Left Panel (shown when in sign-up mode) */}
        <div 
          className={`absolute w-full h-full flex flex-col items-center justify-center p-8 transition-opacity duration-500 ease-in-out ${
            isSignUp ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <h2 className="text-2xl font-bold mb-4">Welcome Back!</h2>
          <p className="mb-8">Already have an account? Sign in now</p>
          <button 
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setError(null);
              setSuccess(null);
            }}
            className="px-8 py-2 border border-white rounded hover:bg-white hover:bg-opacity-10"
          >
            SIGN IN
          </button>
        </div>
        
        {/* Right Panel (shown when in sign-in mode) */}
        <div 
          className={`absolute w-full h-full flex flex-col items-center justify-center p-8 transition-opacity duration-500 ease-in-out ${
            isSignUp ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <h2 className="text-2xl font-bold mb-4">Hello, Friend!</h2>
          <p className="mb-8">Enter your details to start your journey with us</p>
          <button 
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setError(null);
              setSuccess(null);
            }}
            className="px-8 py-2 border border-white rounded hover:bg-white hover:bg-opacity-10"
          >
            SIGN UP
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;