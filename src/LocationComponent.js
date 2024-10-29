import React, { useState, useEffect } from 'react';
import './LocationComponent.css'; // Add a CSS file for styling

const LocationComponent = () => {
    const [location, setLocation] = useState({ latitude: null, longitude: null, error: null });

    useEffect(() => {
        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        // Handle the result of speech recognition
        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
            console.log('Recognized speech:', transcript);

            if (transcript === 'help me' || transcript === 'help me.') {
                getLocation();
            }
        };

        // Start recognition when the component mounts
        recognition.start();

        // Cleanup function to stop recognition when the component unmounts
        return () => {
            recognition.stop();
        };
    }, []);

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        error: null
                    });
                    sendLocationToServer(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    setLocation({
                        latitude: null,
                        longitude: null,
                        error: error.message
                    });
                }
            );
        } else {
            setLocation({
                latitude: null,
                longitude: null,
                error: "Geolocation is not supported by this browser."
            });
        }
    };

    const sendLocationToServer = async (latitude, longitude) => {
        try {
            const response = await fetch('https://localhost:7128/api/location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ latitude, longitude }),
            });

            if (!response.ok) {
                throw new Error('Failed to send location data to the server');
            }
            console.log('Location sent successfully');
        } catch (error) {
            console.error(`Error sending location data: ${error.message}`);
        }
    };

    return (
        <div className="location-container">
            <h1>Women's Safety App</h1>
            <p>If you need help, just say "Help me".</p>
            <button className="emergency-button" onClick={getLocation}>Emergency Button</button>
            {location.latitude && location.longitude ? (
                <p className="location-info">
                    Your location: Latitude {location.latitude}, Longitude {location.longitude}
                </p>
            ) : (
                <p className="error-message">{location.error}</p>
            )}
        </div>
    );
};

export default LocationComponent;
