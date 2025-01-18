'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const AstroDetails = () => {
  const [astrologyData, setAstrologyData] = useState<any[] | null>(null);

  useEffect(() => {
    const data = localStorage.getItem('astrologyData');
    if (data) {
      setAstrologyData(JSON.parse(data));
    }
  }, []);

  const getZodiacSymbol = (sign: string) => {
    const symbols: { [key: string]: string } = {
      Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
      Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
      Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
    };
    return symbols[sign] || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-yellow-300 mb-4">Deeper Astrological Insights</h1>
          <p className="text-xl text-purple-200">Uncover the secrets of your celestial alignment</p>
        </header>

        <Link href="/" className="inline-flex items-center text-yellow-300 hover:text-yellow-400 mb-8">
          <ArrowLeft className="mr-2" />
          Back to Cosmic Profile
        </Link>

        {astrologyData ? (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {astrologyData.map((planet, index) => (
                <div key={index} className="bg-indigo-800 bg-opacity-50 p-6 rounded-lg shadow-lg cosmic-border">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center">
                    {planet.name === 'Sun' && <Sun className="mr-2 text-yellow-400" />}
                    {planet.name === 'Moon' && <Moon className="mr-2 text-blue-300" />}
                    {planet.name !== 'Sun' && planet.name !== 'Moon' && <Star className="mr-2 text-yellow-300" />}
                    {planet.name}
                  </h2>
                  <div className="space-y-2">
                    <p><strong>Sign:</strong> {planet.sign} {getZodiacSymbol(planet.sign)}</p>
                    <p><strong>Degree:</strong> {planet.fullDegree}°</p>
                    <p><strong>House:</strong> {planet.house}</p>
                    <p><strong>Is Retrograde:</strong> {planet.isRetro ? 'Yes' : 'No'}</p>
                    <p><strong>Nakshatra:</strong> {planet.nakshatra}</p>
                    <p><strong>Nakshatra Lord:</strong> {planet.nakshatraLord}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link href="../birthChart" className="inline-block py-2 px-4 bg-yellow-500 text-indigo-900 rounded-md hover:bg-yellow-400 transition duration-300">
                View Your Complete Birth Chart
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center bg-purple-800 bg-opacity-50 p-8 rounded-lg shadow-lg">
            <p className="text-xl">No astrology data available.</p>
            <p className="mt-4">Please return to the main page and enter your birth details to generate your astrological insights.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AstroDetails;

