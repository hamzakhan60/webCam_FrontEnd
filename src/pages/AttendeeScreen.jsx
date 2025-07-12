import React, { useEffect, useRef, useState } from "react";
import { Clock, Activity, BarChart3 } from "lucide-react";
import { useLocation } from 'react-router-dom';

// Simulating the query parameters from URL - in a real app you'd use react-router-dom
const AttendeeScreen = () => {
    const { search } = useLocation();
    const query = new URLSearchParams(search);
    const name = query.get("name");
    const email = query.get("email");
    const meetingKey = query.get("meetingKey");
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [status, setStatus] = useState("Connecting...");
    const [isMeetingActive, setIsMeetingActive] = useState(true);

    // Dummy report data
    const [reportData, setReportData] = useState({
        focusPercentage: 82,
        lastUpdate: new Date(),
        attentionStatus: "Focused",
        reportHistory: []
    });

    // Start webcam
    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (err) {
                console.error("Failed to start webcam:", err);
                setStatus("Webcam Error");
            }
        };
        startCamera();
    }, []);

    // Send screenshot every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (!videoRef.current || !canvasRef.current) return;

            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const base64Image = canvas.toDataURL("image/jpeg");

            sendReport(base64Image);

            // Update dummy report data
            updateDummyReport();
        }, 10000); // every 10 seconds

        return () => clearInterval(interval);
    }, []);

    const updateDummyReport = () => {
        // Simulate varying focus scores

        fetch(`http://localhost:5000/report-history?meetingKey=${meetingKey}&email=${email}`)
            .then(res => res.json())
            .then(data => {
                const reportItem = {
                    timestamp: new Date(),
                    status: data.status,
                    focusScore: data.focusScore,
                    screenshot: data.screenshot
                };

                setReportData(prev => ({
                    ...prev,
                    focusPercentage: data.focusScore,
                    lastUpdate: new Date(),
                    attentionStatus: data.status,
                    reportHistory: [...prev.reportHistory.slice(-2), reportItem]
                }));
            });

    };

    const sendReport = async (screenshot) => {
        try {
            console.log(screenshot);
            console.log(name, email, meetingKey);
            const response = await fetch("http://localhost:5000/analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    attendeeEmail: email,
                    meetingKey: meetingKey,
                    screenshot: screenshot
                })
            });

            const data = await response.json();
            if (data.status) {
                setStatus(data.status);
            }
        } catch (err) {
            console.error("Error sending report:", err);
            setStatus("Error");
        }
    };

    const leaveMeeting = () => {
        const tracks = videoRef.current?.srcObject?.getTracks();
        tracks?.forEach(track => track.stop());
        setIsMeetingActive(false);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!isMeetingActive) {
        return (
            <div className="flex items-center justify-center h-screen text-2xl font-bold text-gray-700">
                You left the meeting.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-3xl font-semibold">Welcome, {name}</h2>
                    <p className="text-lg text-gray-600">
                        Meeting Status: <span className="font-bold text-blue-600">{status}</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column - webcam */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="p-4 bg-blue-600 text-white font-medium">
                                Your Camera Feed
                            </div>
                            <div className="p-2">
                                <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover rounded" />
                                <canvas ref={canvasRef} className="hidden" />
                            </div>
                            <div className="p-4 border-t">
                                <button
                                    onClick={leaveMeeting}
                                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                                >
                                    Leave Meeting
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right column - reports */}
                    <div className="lg:col-span-2">
                        {/* Current status card */}
                        <div className="bg-white rounded-lg shadow-lg mb-6">
                            <div className="p-4 bg-blue-600 text-white font-medium">
                                Current Status
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="border rounded-lg p-4 text-center">
                                        <Clock size={24} className="mx-auto mb-2 text-blue-600" />
                                        <p className="text-gray-600 mb-1">Last Update</p>
                                        <p className="font-bold">{formatTime(reportData.lastUpdate)}</p>
                                    </div>
                                    <div className="border rounded-lg p-4 text-center">
                                        <Activity size={24} className="mx-auto mb-2 text-blue-600" />
                                        <p className="text-gray-600 mb-1">Status</p>
                                        <p className={`font-bold ${reportData.attentionStatus === "Focused" ? "text-green-600" : "text-orange-600"}`}>
                                            {reportData.attentionStatus}
                                        </p>
                                    </div>
                                    <div className="border rounded-lg p-4 text-center">
                                        <BarChart3 size={24} className="mx-auto mb-2 text-blue-600" />
                                        <p className="text-gray-600 mb-1">Focus Score</p>
                                        <p className="font-bold">{reportData.focusPercentage}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* History cards */}
                        <div className="bg-white rounded-lg shadow-lg">
                            <div className="p-4 bg-blue-600 text-white font-medium">
                                Report History
                            </div>
                            <div className="p-4">
                                {reportData.reportHistory.map((report, index) => (
                                    <div key={index} className="border-b last:border-b-0 py-4">
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="w-full md:w-1/3">
                                                <img
                                                    src={report.screenshot}
                                                    alt={`Screenshot at ${formatTime(report.timestamp)}`}
                                                    className="w-full rounded"
                                                />
                                            </div>
                                            <div className="w-full md:w-2/3">
                                                <div className="flex justify-between mb-2">
                                                    <p className="text-gray-600">{formatTime(report.timestamp)}</p>
                                                    <p className={`font-medium ${report.status === "Focused" ? "text-green-600" : "text-orange-600"}`}>
                                                        {report.status}
                                                    </p>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-4">
                                                    <div
                                                        className={`h-4 rounded-full ${report.status === "Focused" ? "bg-green-600" : "bg-orange-600"}`}
                                                        style={{ width: `${report.focusScore}%` }}
                                                    ></div>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-600">Focus Score: {report.focusScore}%</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendeeScreen;