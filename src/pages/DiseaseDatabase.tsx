import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { diseaseDatabase, DiseaseEntry } from '@/data/diseaseDatabase';
import { ArrowLeft, Filter } from 'lucide-react';

const typeColors: Record<string, string> = {
  Fungal: 'bg-green-100 text-green-800',
  Bacterial: 'bg-yellow-100 text-yellow-800',
  Viral: 'bg-pink-100 text-pink-800',
  Pest: 'bg-red-100 text-red-800',
  Deficiency: 'bg-blue-100 text-blue-800',
  Physiological: 'bg-purple-100 text-purple-800',
  Phytoplasma: 'bg-indigo-100 text-indigo-800',
  Other: 'bg-gray-100 text-gray-800',
};

const severityColors: Record<string, string> = {
  Low: 'bg-blue-100 text-blue-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-orange-100 text-orange-800',
  Critical: 'bg-red-100 text-red-800',
  Moderate: 'bg-yellow-100 text-yellow-800',
  Severe: 'bg-red-100 text-red-800',
  'Low to Moderate': 'bg-blue-100 text-blue-800',
};

const DiseaseDatabase: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [selected, setSelected] = useState<DiseaseEntry | null>(null);
  const navigate = useNavigate();

  // Get unique types and severities for filter options
  const uniqueTypes = Array.from(new Set(diseaseDatabase.map(d => d.type)));
  const uniqueSeverities = Array.from(new Set(diseaseDatabase.map(d => d.severity)));

  const filtered = diseaseDatabase.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.cropsAffected.some(crop => crop.toLowerCase().includes(search.toLowerCase()));
    
    const matchesType = selectedType === '' || d.type === selectedType;
    const matchesSeverity = selectedSeverity === '' || d.severity === selectedSeverity;
    
    return matchesSearch && matchesType && matchesSeverity;
  });

  const clearFilters = () => {
    setSearch('');
    setSelectedType('');
    setSelectedSeverity('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pb-12">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200 px-4 py-6 mb-8 shadow-sm flex items-center">
        <button
          className="flex items-center text-black hover:text-gray-700 font-semibold mr-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back
        </button>
        <h1 className="text-4xl font-extrabold text-center text-black mb-2 tracking-tight flex-1">Disease Database</h1>
        <div className="flex-1" />
      </div>
      
      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Search & Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by disease name or crop..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Disease Type</label>
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
              <select
                value={selectedSeverity}
                onChange={e => setSelectedSeverity(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="">All Severities</option>
                {uniqueSeverities.map(severity => (
                  <option key={severity} value={severity}>{severity}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filtered.length} of {diseaseDatabase.length} diseases
            </div>
            {(search || selectedType || selectedSeverity) && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map(disease => (
          <div
            key={disease.id}
            className="group bg-white rounded-xl shadow-md p-4 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg border border-gray-100 relative"
            onClick={() => setSelected(disease)}
          >
            <h2 className="font-bold text-lg text-black mb-2 truncate">{disease.name}</h2>
            <div className="flex flex-wrap gap-1 mb-2">
              {disease.cropsAffected.slice(0, 2).map(crop => (
                <span key={crop} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">{crop}</span>
              ))}
              {disease.cropsAffected.length > 2 && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">+{disease.cropsAffected.length - 2}</span>
              )}
            </div>
            <div className="flex gap-1 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${typeColors[disease.type]}`}>{disease.type}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${severityColors[disease.severity]}`}>{disease.severity}</span>
            </div>
            <p className="text-gray-600 text-xs line-clamp-2 mb-2 leading-relaxed">{disease.symptoms.join('; ')}</p>
            <button className="absolute top-2 right-2 bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs font-semibold opacity-0 group-hover:opacity-100 transition">View</button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No diseases found matching your criteria.</p>
          <button
            onClick={clearFilters}
            className="mt-4 text-green-600 hover:text-green-800 underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Modal for details */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full relative shadow-2xl border border-gray-200 animate-fade-in" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl font-bold" onClick={() => setSelected(null)}>&times;</button>
            <h2 className="text-3xl font-extrabold text-black mb-2">{selected.name}</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${typeColors[selected.type]}`}>{selected.type}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${severityColors[selected.severity]}`}>{selected.severity}</span>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">Crops Affected</h3>
              <ul className="flex flex-wrap gap-2 ml-2 text-gray-700 text-sm">
                {selected.cropsAffected.map((crop, i) => <li key={i} className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium list-none">{crop}</li>)}
              </ul>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">Symptoms</h3>
              <ul className="list-disc ml-6 text-gray-700 text-sm">
                {selected.symptoms.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">Causes</h3>
              <ul className="list-disc ml-6 text-gray-700 text-sm">
                {selected.causes.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">Treatments</h3>
              <ul className="list-disc ml-6 text-gray-700 text-sm">
                {selected.treatments.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">Preventive Measures</h3>
              <ul className="list-disc ml-6 text-gray-700 text-sm">
                {selected.preventiveMeasures.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
            {selected.economicImpact && (
              <div className="mb-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">Economic Impact</h3>
                <p className="text-gray-700 text-sm ml-2">{selected.economicImpact}</p>
              </div>
            )}
            {selected.seasonality && (
              <div className="mb-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">Seasonality</h3>
                <p className="text-gray-700 text-sm ml-2">{selected.seasonality}</p>
              </div>
            )}
            {selected.references && (
              <div className="mt-2">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">Reference</h3>
                <ul className="list-disc ml-6 text-blue-700 text-sm">
                  {selected.references.map(ref => (
                    <li key={ref}><a href={ref} className="underline" target="_blank" rel="noopener noreferrer">{ref}</a></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseDatabase; 