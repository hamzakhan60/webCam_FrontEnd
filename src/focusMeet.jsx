import { useState } from 'react';
import { Calendar, Clock, Users, Video, Download, Monitor } from 'lucide-react';
import WebcamCard from './components/WebCamCard';
import { useNavigate } from 'react-router-dom';

export default function FocusMeet() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('create');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingId, setMeetingId] = useState('');
  
  // Added states for API responses
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Function to create meeting
  const handleCreateMeeting = async () => {
    if (!meetingTitle.trim()) {
      setMessage({ text: 'Please enter a meeting title', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ text: '', type: '' });
      
      // Get host information from localStorage
      const hostData = JSON.parse(localStorage.getItem('user')) || {};
      console.log('Host data:', hostData);
      const hostId = hostData.userKey || '';
      
      if (!hostId) {
        setMessage({ text: 'Host information not found. Please log in again.', type: 'error' });
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/meetings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: meetingTitle,
          hostId: hostId
        }),
      });

      const data = await response.json();
      console.log('Create meeting response:', data.meeting.meetingKey);
      setMeetingId(data.meeting.meetingKey);

      if (response.ok) {
        setMessage({ text: `Meeting created successfully! Meeting key: ${data.meeting.meetingKey}`, type: 'success' });
        navigate(`/organizer?meetingKey=${encodeURIComponent(data.meeting.meetingKey)}`);
      } else {
        setMessage({ text: data.message || 'Failed to create meeting', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An error occurred while creating the meeting', type: 'error' });
      console.error('Create meeting error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to join meeting
  const handleJoinMeeting = async () => {
    if (!meetingId.trim()) {
      setMessage({ text: 'Please enter a meeting ID', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ text: '', type: '' });
      
      // Get attendee information from localStorage
      const userData = JSON.parse(localStorage.getItem('user')) || {};
      
      if (!userData.name || !userData.email) {
        setMessage({ text: 'Attendee information not found. Please log in again.', type: 'error' });
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/meetings/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingKey: meetingId,
          attendee: {
            name: userData.name,
            email: userData.email
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: 'Successfully joined the meeting!', type: 'success' });
        navigate(`/attendee?name=${encodeURIComponent(userData.name)}&email=${encodeURIComponent(userData.email)}&meetingKey=${encodeURIComponent(meetingId)}`);;
      } else {
        setMessage({ text: data.message || 'Failed to join meeting', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An error occurred while joining the meeting', type: 'error' });
      console.error('Join meeting error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="w-screen mx-auto">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Welcome to FocusMeet</h1>
                <p className="text-sm text-gray-600 mt-1">Join or create meetings with real-time focus detection through webcam.</p>
              </div>
              <div className="border-l border-blue-300 h-10"></div>
              <div className="flex space-x-2">
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  onClick={() => setActiveTab('create')}
                >
                  Create Meeting
                </button>
                <button 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                  onClick={() => setActiveTab('join')}
                >
                  Join Meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-screen mx-auto p-4 space-y-6 flex-1">
        
        {/* API Response Message */}
        {message.text && (
          <div className={`p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}
        
        {/* Create Meeting Panel */}
        {activeTab === 'create' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Create Meeting</h2>
            <div className="border-b border-gray-200 mb-4"></div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="meetingTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  id="meetingTitle"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="Weekly Team Meeting"
                />
              </div>
              
              <button 
                className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                onClick={handleCreateMeeting}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Generate Meeting'}
              </button>
              
              {/* Only show if a meeting key is available in the success message */}
              {message.type === 'success' && message.text.includes('Meeting key') && (
                <div className="bg-gray-100 rounded-md p-3 flex items-center text-sm text-gray-700">
                  <span>{meetingId}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Join Meeting Panel */}
        {activeTab === 'join' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Join Meeting</h2>
            <div className="border-b border-gray-200 mb-4"></div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="meetingId" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Meeting Code
                </label>
                <input
                  type="text"
                  id="meetingId"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={meetingId}
                  onChange={(e) => setMeetingId(e.target.value)}
                  placeholder="XXX-XXX-XXX"
                />
              </div>
              
              <div className="flex justify-center">
                <button 
                  className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  onClick={handleJoinMeeting}
                  disabled={loading}
                >
                  {loading ? 'Joining...' : 'Join Meeting'}
                </button>
              </div>
            </div>
          </div>
        )}
      
        
     
        
       
        
      </div>
    </div>
  );
}