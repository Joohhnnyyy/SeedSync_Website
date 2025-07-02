import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Upload, Camera, CheckCircle, AlertCircle, User } from 'lucide-react';
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useState, useRef, useEffect } from 'react';
import { apiUrl } from "../lib/utils";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
}

const backendBaseUrl = "https://backed-23ow.onrender.com"; // <-- Updated backend URL
function getFullImageUrl(imageUrl: string | null) {
  if (imageUrl && imageUrl.startsWith("/uploads/")) {
    return backendBaseUrl + imageUrl;
  }
  return imageUrl;
}

const Profile = () => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: ''
  });

  const [originalData, setOriginalData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: ''
  });

  // Get current user ID (you can replace this with actual auth user ID)
  const getUserId = () => {
    return auth.currentUser?.uid || 'default_user';
  };

  // Load profile data from backend
  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const userId = getUserId();
      const response = await fetch(apiUrl(`/api/profile/${userId}`));
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setProfileData(result.data);
          setOriginalData(result.data);
          
          // Check if there's a profile image in the backend data
          if (result.data.profileImage) {
            setProfileImage(result.data.profileImage);
            setImageLoadError(false);
          }
        }
      } else {
        console.error('Failed to load profile');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load profile on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const confirmLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      handleLogout();
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setShowError(false);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        setIsUploading(false);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        setIsUploading(false);
        return;
      }

      try {
        const userId = getUserId();
        const formData = new FormData();
        formData.append('image', file);

        console.log('Uploading image for user:', userId);
        const response = await fetch(apiUrl(`/api/profile/${userId}/image`), {
          method: 'POST',
          body: formData
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (response.ok) {
          const result = await response.json();
          console.log('Response result:', result);
          
          if (result.success) {
            setProfileImage(result.imageUrl);
            setImageLoadError(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
          } else {
            setErrorMessage(result.message || 'Failed to upload image');
            setShowError(true);
          }
        } else {
          let errorMessage = 'Failed to upload image';
          try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
          } catch (e) {
            console.error('Could not parse error response:', e);
          }
          setErrorMessage(errorMessage);
          setShowError(true);
        }
      } catch (error) {
        console.error('Upload error:', error);
        setErrorMessage('Failed to upload image. Please try again.');
        setShowError(true);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeProfileImage = async () => {
    try {
      const userId = getUserId();
      const response = await fetch(apiUrl(`/api/profile/${userId}/image`), {
        method: 'DELETE'
      });

      if (response.ok) {
        setProfileImage(null);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setErrorMessage('Failed to remove image');
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage('Failed to remove image. Please try again.');
      setShowError(true);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!profileData.firstName.trim()) {
      setErrorMessage('First name is required');
      setShowError(true);
      return false;
    }
    if (!profileData.lastName.trim()) {
      setErrorMessage('Last name is required');
      setShowError(true);
      return false;
    }
    if (!profileData.email.trim()) {
      setErrorMessage('Email is required');
      setShowError(true);
      return false;
    }
    if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      setErrorMessage('Please enter a valid email address');
      setShowError(true);
      return false;
    }
    if (profileData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(profileData.phone.replace(/\s/g, ''))) {
      setErrorMessage('Please enter a valid phone number');
      setShowError(true);
      return false;
    }
    return true;
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setShowError(false);
    setShowSuccess(false);

    // Only send changed fields
    const changedFields: Partial<ProfileData> = {};
    (Object.keys(profileData) as (keyof ProfileData)[]).forEach((key) => {
      if (profileData[key] !== originalData[key]) {
        changedFields[key] = profileData[key];
      }
    });

    if (Object.keys(changedFields).length === 0) {
      setIsSaving(false);
      return;
    }

    try {
      const userId = getUserId();
      const response = await fetch(apiUrl(`/api/profile/${userId}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(changedFields)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setOriginalData(result.data);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        } else {
          setErrorMessage('Failed to save changes');
          setShowError(true);
        }
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.detail || 'Failed to save changes');
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage('Failed to save changes. Please try again.');
      setShowError(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setShowError(false);
    setShowSuccess(false);
    setErrorMessage("");
  };

  const hasChanges = () => {
    return JSON.stringify(profileData) !== JSON.stringify(originalData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-20">
        <motion.section 
          className="py-10 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center mb-8 sm:mb-12 gap-4 sm:gap-0">
              <Button asChild variant="ghost" className="w-fit order-1 sm:order-none">
                <Link to="/dashboard" className="flex items-center text-black hover:text-gray-700">
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Link>
              </Button>
              <div className="flex-grow text-center order-2 sm:order-none">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-2 sm:mb-4">
                  Your Profile
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 px-4 sm:px-0">
                  Manage your account information and preferences.
                </p>
              </div>
            </div>

            {/* Success/Error Messages */}
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center"
              >
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800">Profile updated successfully!</span>
              </motion.div>
            )}

            {showError && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center"
              >
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800">{errorMessage}</span>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="shadow-lg text-center bg-white">
                  <CardContent className="p-6 sm:p-8">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4">
                      {profileImage && !imageLoadError ? (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-gray-200">
                          <img 
                            src={getFullImageUrl(profileImage)} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                            onError={() => setImageLoadError(true)}
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-full flex items-center justify-center border-4 border-gray-200">
                          <User className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500" />
                        </div>
                      )}
                      
                      {/* Upload overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-lg sm:text-xl font-bold text-black mb-4">
                      Profile Picture
                    </h3>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={triggerFileInput}
                        disabled={isUploading}
                        className="w-full"
                      >
                        {isUploading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                            Uploading...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Image
                          </div>
                        )}
                      </Button>
                      
                      {profileImage && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={removeProfileImage}
                          className="w-full text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    <p className="text-xs text-gray-500 mt-3">
                      JPG, PNG or GIF. Max 5MB.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                className="md:col-span-2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card className="shadow-lg bg-white">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-black">
                      Account Information
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input 
                          id="firstName" 
                          type="text" 
                          value={profileData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="h-12 bg-gray-100 border-gray-300 placeholder-gray-600"
                          placeholder="Enter your first name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input 
                          id="lastName" 
                          type="text" 
                          value={profileData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="h-12 bg-gray-100 border-gray-300 placeholder-gray-600"
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="h-12 bg-gray-100 border-gray-300 placeholder-gray-600"
                        placeholder="Enter your email address"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="h-12 bg-gray-100 border-gray-300 placeholder-gray-600"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Farm Location</Label>
                      <Input 
                        id="location" 
                        type="text" 
                        value={profileData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="h-12 bg-gray-100 border-gray-300 placeholder-gray-600"
                        placeholder="Enter your farm location"
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                      <Button 
                        className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto"
                        onClick={handleSaveChanges}
                        disabled={isSaving || !hasChanges()}
                      >
                        {isSaving ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </div>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="w-full sm:w-auto sm:ml-auto"
                        onClick={confirmLogout}
                        disabled={isSaving}
                      >
                        Logout
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </div>
      
      <Footer />
    </div>
  );
};

export default Profile;
