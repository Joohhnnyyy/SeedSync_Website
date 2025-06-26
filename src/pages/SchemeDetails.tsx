import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FileText, Calendar, Users, DollarSign, Info, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { apiUrl } from "../lib/utils";

interface Scheme {
  id: string;
  name: string;
  description: string;
  type?: string;
  eligibility?: string;
  benefits?: string;
  how_to_apply?: string;
  source?: string;
  coverage?: string;
  crop_types?: string[];
  components?: any;
  implementation?: any;
  financial_support?: any;
  [key: string]: any;
}

const SchemeDetails = () => {
  const { schemeId } = useParams<{ schemeId: string }>();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchemeDetails = async () => {
      if (!schemeId) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(apiUrl(`/api/schemes/${schemeId}`));
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Scheme not found');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setScheme(data);
      } catch (err) {
        console.error('Error fetching scheme details:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch scheme details');
      } finally {
        setLoading(false);
      }
    };

    fetchSchemeDetails();
  }, [schemeId]);

  const renderDetailSection = (title: string, content: any, icon?: React.ReactNode) => {
    if (!content) return null;

    let displayContent;
    if (typeof content === 'string') {
      displayContent = <p className="whitespace-pre-line text-gray-700 leading-relaxed">{content}</p>;
    } else if (typeof content === 'object') {
      displayContent = (
        <div className="space-y-4">
          {Object.entries(content).map(([key, value]) => (
            <div key={key} className="border-l-4 border-blue-100 pl-4">
              <h4 className="font-semibold text-gray-800 mb-2 capitalize">
                {key.replace(/_/g, ' ')}
              </h4>
              {typeof value === 'string' ? (
                <p className="whitespace-pre-line text-gray-700">{value}</p>
              ) : (
                <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
                  {JSON.stringify(value, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-xl">{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {displayContent}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-gray-600">Loading scheme details...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Schemes
          </Button>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Schemes
          </Button>
          <Alert>
            <AlertDescription>Scheme not found</AlertDescription>
          </Alert>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Schemes
        </Button>

        {/* Scheme Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div>
                    <CardTitle className="text-3xl font-bold text-gray-900">
                      {scheme.name}
                    </CardTitle>
                    {scheme.type && (
                      <Badge className="mt-2 bg-green-500 text-white rounded-full px-3 py-1 text-sm font-semibold">
                        {scheme.type}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription className="text-lg text-gray-600 mt-4">
                  {scheme.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Scheme Details */}
        <div className="space-y-6">
          {renderDetailSection('Eligibility', scheme.eligibility, <Users className="h-5 w-5 text-green-600" />)}
          {renderDetailSection('Benefits', scheme.benefits, <DollarSign className="h-5 w-5 text-green-600" />)}
          {renderDetailSection('How to Apply', scheme.how_to_apply, <Calendar className="h-5 w-5 text-blue-600" />)}
          {renderDetailSection('Components', scheme.components, <Info className="h-5 w-5 text-purple-600" />)}
          {renderDetailSection('Implementation', scheme.implementation, <Info className="h-5 w-5 text-orange-600" />)}
          {renderDetailSection('Financial Support', scheme.financial_support, <DollarSign className="h-5 w-5 text-green-600" />)}
          
          {/* Additional fields */}
          {scheme.coverage && renderDetailSection('Coverage', scheme.coverage, <Info className="h-5 w-5 text-blue-600" />)}
          {scheme.crop_types && renderDetailSection('Crop Types', scheme.crop_types.join(', '), <Info className="h-5 w-5 text-green-600" />)}
        </div>

        {/* Official Website Link */}
        {scheme.source && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Get More Information</h3>
                <Button 
                  onClick={() => window.open(scheme.source, '_blank')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Official Website
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default SchemeDetails; 