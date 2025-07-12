import { useState, useEffect, useRef } from 'react';
import { Users, Clock, AlertCircle, Award, Download, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function MeetingOrganizer() {
    const pdfRef = useRef();
    const navigate = useNavigate();
    const { search } = useLocation();
    const query = new URLSearchParams(search);
    const meetingKey = query.get("meetingKey");
    const [meetingData, setMeetingData] = useState({
        id: 'M123456',
        title: 'Project Status Update',
        startTime: '2025-05-16T14:00:00',
        duration: '01:15:32',
        attendees: []
    });

    const handleDownload = async () => {
        try {
            // Create a new PDF document
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 10;
            const contentWidth = pageWidth - 2 * margin;
            let y = 20;

            // Title
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text(meetingData.title, pageWidth / 2, y, { align: 'center' });
            y += 10;

            // Date and time
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Started: ${formatDate(meetingData.startTime)}`, pageWidth / 2, y, { align: 'center' });
            y += 15;

            // Meeting ID
            doc.setFontSize(10);
            doc.text(`Meeting ID: ${meetingData.meetingKey || meetingData.id}`, pageWidth / 2, y, { align: 'center' });
            y += 15;

            // Meeting Stats
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Meeting Statistics', margin, y);
            y += 10;

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');

            // Create stats table
            const stats = getMeetingStats();
            const statData = [
                ['Duration', meetingData.duration.replace('Duration: ', '')],
                ['Focused Attendees', `${stats.focused} / ${stats.total}`],
                ['Present Attendees', `${stats.present} / ${stats.total}`],
                ['Absent Attendees', `${stats.absent} / ${stats.total}`]
            ];


            autoTable(doc, {
                startY: y,
                margin: { left: margin },
                head: [['Metric', 'Value']],
                body: statData,
                theme: 'grid'
            });

            y = doc.lastAutoTable.finalY + 15;

            // Attendees List
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Attendees', margin, y);
            y += 10;

            if (meetingData.attendees.length === 0) {
                doc.setFontSize(11);
                doc.setFont('helvetica', 'italic');
                doc.text('No attendees have joined this meeting yet.', margin, y);
            } else {
                // Create attendees table
                const attendeeData = meetingData.attendees.map(attendee => [
                    attendee.name,
                    attendee.email,
                    attendee.status,
                    attendee.status === 'Absent' ? 'N/A' : `${attendee.focusPercentage}%`,
                    attendee.timePresent
                ]);

                autoTable(doc, {
                    startY: y,
                    margin: { left: margin },
                    head: [['Name', 'Email', 'Status', 'Focus %', 'Time Present']],
                    body: attendeeData,
                    theme: 'striped',
                    styles: { overflow: 'linebreak' },
                    columnStyles: {
                        0: { cellWidth: 40 },
                        1: { cellWidth: 50 },
                        2: { cellWidth: 25 },
                        3: { cellWidth: 20 },
                        4: { cellWidth: 30 }
                    }
                });
            }

            // Footer
            const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : y + 20;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            doc.text(`Report generated on ${new Date().toLocaleString()}`, pageWidth / 2, finalY, { align: 'center' });

            // Save PDF
            doc.save(`${meetingData.title.replace(/\s+/g, '_')}_Report.pdf`);

        } catch (err) {
            console.error("Error generating PDF:", err);
            alert("There was an error generating the PDF. Please try again.");
        }
    };

    const handleEndMeeting = async () => {
        navigate('/focus-meet');
    };

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Simulate fetching meeting data from API
    useEffect(() => {
        let intervalId;

        const fetchMeetingData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:5000/api/meeting/${meetingKey}/report`);
                const data = await response.json();
                console.log('Fetched meeting data:', data);
                const updatedDuration = durationConverter(data.duration);
                data.duration = updatedDuration;
                setMeetingData(data);
                console.log('Meeting data:', data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load meeting data');
                setLoading(false);
                console.error('Error fetching meeting data:', err);
            }
        };

        if (meetingKey) {
            // Fetch immediately on load
            fetchMeetingData();

            // Set interval to fetch every 5 minutes (5 * 60 * 1000 = 300000 ms)
            intervalId = setInterval(fetchMeetingData, 5 * 60 * 1000);
        }

        // Cleanup the interval on unmount or meetingKey change
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [meetingKey]);

    const durationConverter = (duration) => {
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;
        const updatedDuration = `Duration: ${hours}h ${minutes}m ${seconds}s`

        console.log(`Duration: ${hours}h ${minutes}m ${seconds}s`);
        return updatedDuration;
    }

    // Function to get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Focused':
                return 'bg-green-100 text-green-800';
            case 'Present':
                return 'bg-orange-100 text-orange-800';
            case 'Absent':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Function to get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case 'Focused':
                return <Award className="w-4 h-4" />;
            case 'Present':
                return <Clock className="w-4 h-4" />;
            case 'Absent':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return null;
        }
    };

    // Get meeting statistics
    const getMeetingStats = () => {
        if (!meetingData.attendees.length) return { focused: 0, present: 0, absent: 0, total: 0 };

        const total = meetingData.attendees.length;
        const focused = meetingData.attendees.filter(a => a.status === 'FOCUSED').length;
        const present = meetingData.attendees.filter(a => a.status === 'PRESENT').length;
        const absent = meetingData.attendees.filter(a => a.status === 'ABSENT').length;

        return { focused, present, absent, total };
    };

    const stats = getMeetingStats();

    // Format date
    const formatDate = (dateString) => {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading meeting data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center bg-white p-8 rounded-lg shadow-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                    <h2 className="text-xl font-semibold mt-4 text-red-600">Error Loading Meeting</h2>
                    <p className="mt-2 text-gray-600">{error}</p>
                    <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white shadow-sm rounded-lg mb-6">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{meetingData.title}</h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Started {formatDate(meetingData.startTime)}
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <button onClick={handleDownload} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export Report
                                </button>
                                <button onClick={handleEndMeeting} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                                    End Meeting
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Meeting Stats */}
                    <div className="px-6 py-5">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                                <div className="flex items-center">
                                    <div className="bg-blue-100 p-2 rounded-md">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-blue-800">Duration</p>
                                        <p className="text-xl font-semibold">{meetingData.duration}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-green-50 p-4 rounded-md border border-green-200">
                                <div className="flex items-center">
                                    <div className="bg-green-100 p-2 rounded-md">
                                        <Award className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-green-800">Focused</p>
                                        <p className="text-xl font-semibold">{stats.focused} / {stats.total}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
                                <div className="flex items-center">
                                    <div className="bg-orange-100 p-2 rounded-md">
                                        <Users className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-orange-800">Present</p>
                                        <p className="text-xl font-semibold">{stats.present} / {stats.total}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-red-50 p-4 rounded-md border border-red-200">
                                <div className="flex items-center">
                                    <div className="bg-red-100 p-2 rounded-md">
                                        <AlertCircle className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-red-800">Absent</p>
                                        <p className="text-xl font-semibold">{stats.absent} / {stats.total}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attendees Table */}
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Attendees</h2>
                            <div className="flex items-center">
                                <span className="text-sm text-gray-500">Meeting ID: </span>
                                <span className="ml-1 text-sm font-medium text-blue-600">{meetingData.meetingKey}</span>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Attendee
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Focus %
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Time Present
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {meetingData.attendees.map((attendee) => (
                                    <tr key={attendee.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <span className="text-gray-600 font-medium">
                                                            {attendee.name.split(' ').map(n => n[0]).join('')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{attendee.name}</div>
                                                    <div className="text-sm text-gray-500">{attendee.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(attendee.status)}`}>
                                                {getStatusIcon(attendee.status)}
                                                <span className="ml-1">{attendee.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {attendee.status === 'Absent' ? (
                                                <span className="text-gray-400">N/A</span>
                                            ) : (
                                                <div className="flex items-center">
                                                    <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                                        <div
                                                            className={`h-2.5 rounded-full ${attendee.focusPercentage >= 80 ? 'bg-green-500' :
                                                                attendee.focusPercentage >= 60 ? 'bg-orange-500' : 'bg-red-500'
                                                                }`}
                                                            style={{ width: `${attendee.focusPercentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="ml-2 text-sm text-gray-700">{attendee.focusPercentage}%</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {attendee.timePresent}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty state if no attendees */}
                    {meetingData.attendees.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No attendees</h3>
                            <p className="mt-1 text-sm text-gray-500">No one has joined this meeting yet.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}