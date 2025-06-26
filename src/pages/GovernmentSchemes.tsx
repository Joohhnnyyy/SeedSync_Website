import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  FileText,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiUrl } from "../lib/utils";

interface Scheme {
  id: string;
  name: string;
  description: string;
  eligibility?: string;
  benefits?: string;
  type?: string;
  how_to_apply?: string;
  source?: string;
  coverage?: string;
  crop_types?: string[];
  components?: any;
  implementation?: any;
  financial_support?: any;
  [key: string]: any; // Allow additional properties
}

interface SchemesResponse {
  total: number;
  schemes: Scheme[];
  limit: number;
  offset: number;
}

const GovernmentSchemes = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    schemeType: '',
  });
  const [sortBy, setSortBy] = useState('name-asc');
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalSchemes, setTotalSchemes] = useState(0);
  const [allSchemeTypes, setAllSchemeTypes] = useState<string[]>([]);
  const isMounted = React.useRef(false);
  const ITEMS_PER_PAGE = 8; // Increased items per page for the new layout

  const fetchSchemes = async (isInitialLoad = false) => {
    try {
      setLoading(true);
      setError(null);
      const offset = (page - 1) * ITEMS_PER_PAGE;
      const queryParams = new URLSearchParams({
        limit: ITEMS_PER_PAGE.toString(),
        offset: offset.toString(),
      });

      if (searchQuery) {
        queryParams.append('search', searchQuery);
      }
      if (filters.schemeType && filters.schemeType !== 'all') {
        queryParams.append('scheme_type', filters.schemeType);
      }
      
      const response = await fetch(apiUrl(`/api/schemes?${queryParams}`));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: SchemesResponse = await response.json();
      setSchemes(data.schemes);
      setTotalSchemes(data.total);

      if (isInitialLoad) {
        const allSchemesResponse = await fetch(apiUrl('/api/schemes?limit=100'));
        const allSchemesData = await allSchemesResponse.json();
        const types = Array.from(new Set(allSchemesData.schemes.map((s: Scheme) => s.type).filter(Boolean)));
        setAllSchemeTypes(types as string[]);
      }
    } catch (err) {
      console.error('Error fetching schemes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch schemes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes(true);
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      const handler = setTimeout(() => {
        setPage(1);
        fetchSchemes();
      }, 500);
      return () => clearTimeout(handler);
    } else {
      isMounted.current = true;
    }
  }, [searchQuery, filters]);

  useEffect(() => {
    if (isMounted.current) {
      fetchSchemes();
    }
  }, [page]);

  const sortedSchemes = useMemo(() => {
    const sorted = [...schemes];
    if (sortBy === 'name-asc') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    }
    return sorted;
  }, [schemes, sortBy]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 bg-white border-b">
        <div className="max-w-7xl mx-auto">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 -ml-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
            </Button>
          <h1 className="text-3xl font-bold text-gray-900">Schemes for Farmers</h1>
          <p className="text-gray-500 mt-1">
            Browse and find relevant government schemes and subsidies.
              </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Actions Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="w-full md:w-1/3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
                </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
                  <Select onValueChange={(value) => handleFilterChange('schemeType', value)}>
              <SelectTrigger className="w-full md:w-[180px] border-gray-200">
                <SelectValue placeholder="Scheme Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {allSchemeTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px] border-gray-200">
                <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                <SelectItem value="name-asc">Sort by Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Sort by Name (Z-A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
          </div>

          {/* Main Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {[...Array(8)].map((_, i) => (
              <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
            ))}
              </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>
              {error}. Please try again later.
            </AlertDescription>
          </Alert>
        ) : sortedSchemes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedSchemes.map((scheme) => (
                <Card 
                  key={scheme.id} 
                  className="hover:shadow-lg transition-shadow duration-300 flex flex-col cursor-pointer"
                  onClick={() => navigate(`/schemes/${scheme.id}`)}
                >
                  <CardContent className="p-6 flex-grow">
                    <FileText className="h-8 w-8 mb-4 text-blue-500" />
                    <h3 className="text-lg font-semibold mb-2 truncate" title={scheme.name}>{scheme.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">{scheme.description}</p>
                        </CardContent>
                      </Card>
              ))}
                </div>

                {totalSchemes > ITEMS_PER_PAGE && (
                  <div className="flex items-center justify-center space-x-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {page} of {Math.ceil(totalSchemes / ITEMS_PER_PAGE)}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => p + 1)}
                      disabled={page >= Math.ceil(totalSchemes / ITEMS_PER_PAGE)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
        ) : (
          <Card>
            <CardContent className="p-10 text-center text-gray-500">
              <p>No schemes found. Try adjusting your search or filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default GovernmentSchemes; 