'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ArrowLeft } from 'lucide-react';

const BirthChart = () => {
  const [birthChart, setBirthChart] = useState<any | null>(null);

  useEffect(() => {
    const storedBirthChart = localStorage.getItem('birthChart');
    if (storedBirthChart) {
      setBirthChart(JSON.parse(storedBirthChart));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-yellow-300 mb-4">Your Birth Chart</h1>
          <p className="text-xl text-purple-200">Discover the celestial blueprint of your life</p>
        </header>

        <Link href="/astroDetails" className="inline-flex items-center text-yellow-300 hover:text-yellow-400 mb-8">
          <ArrowLeft className="mr-2" />
          Back to Astrological Insights
        </Link>

        {birthChart ? (
          <div className="bg-purple-800 bg-opacity-50 p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-semibold mb-6 flex items-center">
              <Star className="mr-2 text-yellow-300" />
              Your Cosmic Blueprint
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Core Astrological Elements</h3>
                <p><strong>Ascendant:</strong> {birthChart.astroDetails.ascendant}</p>
                <p><strong>Moon Sign:</strong> {birthChart.astroDetails.moon_sign}</p>
                <p><strong>Sun Sign:</strong> {birthChart.astroDetails.sun_sign}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Planetary Positions</h3>
                <ul className="list-disc list-inside">
                  {birthChart.planets.map((planet: any, index: number) => (
                    <li key={index} className="mb-2">
                      <span className="font-semibold">{planet.name}:</span> {planet.sign} ({planet.degree}°)
                      {planet.isRetro && <span className="ml-2 text-yellow-300">(Retrograde)</span>}
                    </li>
                  ))}
                </ul>
              </div>
              {birthChart.astroDetails.houses && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Houses</h3>
                  {birthChart.astroDetails.houses.map((house: any, index: number) => (
                    <p key={index}><strong>House {index + 1}:</strong> {house}</p>
                  ))}
                </div>
              )}
              {!birthChart.astroDetails.houses && (
                <p>Houses information is not available.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center bg-purple-800 bg-opacity-50 p-8 rounded-lg shadow-lg">
            <p className="text-xl">No birth chart data available.</p>
            <p className="mt-4">Please return to the main page and enter your birth details to generate your birth chart.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BirthChart;

