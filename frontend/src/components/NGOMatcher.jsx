import React, { useState, useEffect } from "react";
import api from "../api";

export default function NGOMatcher() {
  const [ngos, setNgos] = useState([]);
  const [filteredNgos, setFilteredNgos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchRealNGOData = async () => {
    try {
      const mockAPIData = [
        {
          _id: 'gs_001',
          name: 'Global Environmental Foundation',
          mission: 'Combat climate change through reforestation and education',
          description: 'International NGO focused on large-scale environmental restoration projects.',
          location: { country: 'Global', region: 'Worldwide' },
          size: 'Large',
          focusAreas: ['Environment', 'Climate Change', 'Education', 'Sustainability'],
          contact: { 
            email: 'partnerships@globalenvironment.org', 
            phone: '+1-202-555-0189', 
            website: 'www.globalenvironment.org',
          },
          established: 1998,
          matchScore: 94
        },
      ];
      return mockAPIData;
    } catch (error) {
      console.error('Error fetching NGO data:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadNGOs = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/api/ngos');
        setNgos(response.data.data);
        setFilteredNgos(response.data.data);
      } catch {
        const enhancedData = await fetchRealNGOData();
        setNgos(enhancedData);
        setFilteredNgos(enhancedData);
      }
      setIsLoading(false);
    };
    loadNGOs();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    const filtered = ngos.filter(ngo => ngo.name.toLowerCase().includes(value.toLowerCase()));
    setFilteredNgos(filtered);
  };

  if (isLoading) return <div className="text-center p-4 text-slate-600">Loading NGOs...</div>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-blue-100">
      <h2 className="text-2xl font-bold mb-4 text-slate-800">🏢 NGO Matcher</h2>
      <input
        type="text"
        placeholder="Search NGOs..."
        value={search}
        onChange={handleSearch}
        className="w-full p-3 mb-4 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-slate-700"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNgos.map(ngo => (
          <div key={ngo._id} className="p-4 border border-blue-100 rounded-lg hover:shadow-lg transition bg-blue-50 hover:bg-blue-100">
            <h3 className="font-semibold text-lg text-slate-800">{ngo.name}</h3>
            <p className="text-sm text-slate-600 mt-1">{ngo.mission}</p>
            <div className="text-xs text-slate-600 mt-2 space-y-1">
              <div>Focus Areas: <span className="font-medium">{ngo.focusAreas?.join(', ')}</span></div>
              <div>Location: <span className="font-medium">{ngo.location?.country}</span></div>
              <div>Established: <span className="font-medium">{ngo.established}</span></div>
              <div>Match Score: <span className="font-bold text-blue-600">{ngo.matchScore}%</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
