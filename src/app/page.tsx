'use client';

import { db } from '../../lib/firebaseConfig';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import Link from 'next/link';
import { Moon, Sun, Star } from 'lucide-react';

export default function Home() {
  const [users, setUsers] = useState<any[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [relationshipStatus, setRelationshipStatus] = useState('');
  const [occupation, setOccupation] = useState('');
  const [gender, setGender] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [astrologyData, setAstrologyData] = useState<any | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setUsers(usersList);

      // Pre-fill the form with the first user's details
      if (usersList.length > 0) {
        const user = usersList[0];
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        setEmail(user.email || '');
        setPhoneNumber(user.phoneNumber || '');
        setBirthDate(user.birthDate || '');
        setBirthTime(user.birthTime || '');
        setBirthPlace(user.birthPlace || '');
        setRelationshipStatus(user.relationshipStatus || '');
        setOccupation(user.occupation || '');
        setGender(user.gender || '');
        setPreferredLanguage(user.preferredLanguage || '');
      }
    };

    fetchUsers();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting the form with the following data:', {
      firstName,
      lastName,
      email,
      phoneNumber,
      birthDate,
      birthTime,
      birthPlace,
      relationshipStatus,
      occupation,
      gender,
      preferredLanguage,
      latitude,
      longitude
    });

    if (latitude && longitude) {
      if (users.length > 0) {
        const userRef = doc(db, 'users', users[0].id);
        await updateDoc(userRef, {
          firstName,
          lastName,
          email,
          phoneNumber,
          birthDate,
          birthTime,
          birthPlace,
          relationshipStatus,
          occupation,
          gender,
          preferredLanguage,
          latitude,
          longitude
        });

        console.log('Firestore updated successfully');
        const updatedUsers = users.map((user) =>
          user.id === users[0].id ? {
            ...user,
            firstName,
            lastName,
            email,
            phoneNumber,
            birthDate,
            birthTime,
            birthPlace,
            relationshipStatus,
            occupation,
            gender,
            preferredLanguage,
            latitude,
            longitude
          } : user
        );
        setUsers(updatedUsers);
      }
    } else {
      console.error('Invalid latitude or longitude values');
    }
  };

  // Fetch latitude and longitude for a given city
  const getCoordinatesForCity = async (city: string) => {
    const apiKey = 'fca09516dc9f4bfe885555965b48b884';
    try {
      const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${apiKey}`);
      const data = response.data.results[0];
      if (data) {
        const lat = data.geometry.lat;
        const lon = data.geometry.lng;
        setLatitude(lat);
        setLongitude(lon);
        console.log('Coordinates for city:', lat, lon);
        fetchAstrologyData(lat, lon);
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      alert('Failed to fetch coordinates for the city.');
    }
  };

  // Fetch astrology data based on lat/lon
  const fetchAstrologyData = async (lat: number, lon: number) => {
    const userId = '636870';
    const apiKey = 'f6d382a09153a886ae5831b7224b4eb1c756b8e3';
    const language = 'en';

    const data = {
      day: new Date(birthDate).getDate(),
      month: new Date(birthDate).getMonth() + 1,
      year: new Date(birthDate).getFullYear(),
      hour: parseInt(birthTime.split(':')[0]),
      min: parseInt(birthTime.split(':')[1]),
      lat,
      lon,
      tzone: 5.5,
    };

    const auth = "Basic " + Buffer.from(userId + ":" + apiKey).toString("base64");

    try {
      // Fetch Planets API data
      const planetsResponse = await axios.post('https://json.astrologyapi.com/v1/planets', data, {
        headers: {
          'Authorization': auth,
          'Content-Type': 'application/json',
          'Accept-Language': language,
        },
      });

      // Fetch Astro Details API data
      const astroDetailsResponse = await axios.post('https://json.astrologyapi.com/v1/astro_details', data, {
        headers: {
          'Authorization': auth,
          'Content-Type': 'application/json',
          'Accept-Language': language,
        },
      });

      // Combine the results to create a birth chart
      const birthChart = {
        planets: planetsResponse.data,
        astroDetails: astroDetailsResponse.data
      };

      setAstrologyData(planetsResponse.data);
      localStorage.setItem('astrologyData', JSON.stringify(planetsResponse.data));
      localStorage.setItem('birthChart', JSON.stringify(birthChart));
      console.log('Birth Chart:', birthChart);

      // Update Firestore with the new birth chart
      if (users.length > 0) {
        const userRef = doc(db, 'users', users[0].id);
        await updateDoc(userRef, { birthChart });
        console.log('Birth chart updated in Firestore');
      }
    } catch (error) {
      console.error('Error fetching astrology data:', error);
    }
  };

  // Handle city input change for select
  const handleCityInputChange = (newValue: string) => {
    setBirthPlace(newValue);
    fetchCitySuggestions(newValue);
  };

  // Fetch city suggestions for select
  const fetchCitySuggestions = async (query: string) => {
    if (query.length > 2) {
      const apiKey = "fca09516dc9f4bfe885555965b48b884";
      try {
        const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${apiKey}`);
        const cities = response.data.results.map((result: any) => ({ label: result.formatted, value: result.formatted }));
        setSuggestions(cities);
      } catch (error) {
        console.error('Error fetching city suggestions:', error);
      }
    }
  };

  // Trigger API calls when birthPlace, birthDate, or birthTime are updated
  useEffect(() => {
    if (birthPlace && birthDate && birthTime && latitude && longitude) {
      fetchAstrologyData(latitude, longitude);
    }
  }, [birthPlace, birthDate, birthTime, latitude, longitude]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-yellow-300 mb-4">AskDevi</h1>
          <p className="text-xl text-purple-200">Your Celestial Guide to Life's Journey</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-indigo-800 bg-opacity-50 p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-semibold mb-6 flex items-center">
              <Sun className="mr-2 text-yellow-400" />
              Your Cosmic Profile
            </h2>
            {users.length > 0 ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full p-2 bg-indigo-700 rounded-md focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full p-2 bg-indigo-700 rounded-md focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-2 bg-indigo-700 rounded-md focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="w-full p-2 bg-indigo-700 rounded-md focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Birth Date</label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      required
                      className="w-full p-2 bg-indigo-700 rounded-md focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Birth Time</label>
                    <input
                      type="time"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      required
                      className="w-full p-2 bg-indigo-700 rounded-md focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Birth Place</label>
                  <Select
                    options={suggestions}
                    onInputChange={handleCityInputChange}
                    onChange={(selectedOption) => {
                      if (selectedOption) {
                        setBirthPlace(selectedOption.value);
                        getCoordinatesForCity(selectedOption.value);
                      }
                    }}
                    value={birthPlace ? { label: birthPlace, value: birthPlace } : null}
                    isClearable
                    className="text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Relationship Status</label>
                  <select
                    value={relationshipStatus}
                    onChange={(e) => setRelationshipStatus(e.target.value)}
                    required
                    className="w-full p-2 bg-indigo-700 rounded-md focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="">Select status</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Occupation</label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    required
                    className="w-full p-2 bg-indigo-700 rounded-md focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                    className="w-full p-2 bg-indigo-700 rounded-md focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preferred Language</label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    required
                    className="w-full p-2 bg-indigo-700 rounded-md focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="">Select language</option>
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                    <option value="spanish">Spanish</option>
                    {/* Add more language options as needed */}
                  </select>
                </div>
                <button type="submit" className="w-full py-2 px-4 bg-yellow-500 text-indigo-900 rounded-md hover:bg-yellow-400 transition duration-300">
                  Update Your Cosmic Data
                </button>
              </form>
            ) : (
              <p>Loading your cosmic data...</p>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-purple-800 bg-opacity-50 p-8 rounded-lg shadow-lg">
              <h2 className="text-3xl font-semibold mb-6 flex items-center">
                <Moon className="mr-2 text-blue-300" />
                Your Celestial Coordinates
              </h2>
              {latitude && longitude ? (
                <div>
                  <p>Latitude: {latitude}</p>
                  <p>Longitude: {longitude}</p>
                </div>
              ) : (
                <p>Enter your birth place to reveal your celestial coordinates.</p>
              )}
            </div>

            {astrologyData && (
              <div className="bg-purple-800 bg-opacity-50 p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-semibold mb-6 flex items-center">
                  <Star className="mr-2 text-yellow-300" />
                  Your Astrological Insights
                </h2>
                <div className="space-y-2">
                  <p><strong>Planet:</strong> {astrologyData[0]?.name}</p>
                  <p><strong>Sign:</strong> {astrologyData[0]?.sign}</p>
                  <p><strong>Degree:</strong> {astrologyData[0]?.fullDegree}</p>
                  <p><strong>Is Retrograde:</strong> {astrologyData[0]?.isRetro ? 'Yes' : 'No'}</p>
                </div>
                <Link href="./astroDetails" className="inline-block mt-4 py-2 px-4 bg-indigo-600 rounded-md hover:bg-indigo-500 transition duration-300">
                  Explore Deeper Astrological Insights
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

