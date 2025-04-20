"use client";

import React, { useState } from 'react';
import Image from 'next/image';

// User profile type
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  imageUrl: string;
  createdAt: string;
  timeZone: string;
  language: string;
}

// Notification preferences type
interface NotificationPreferences {
  email: {
    travelReminders: boolean;
    documentReminders: boolean;
    newRequirements: boolean;
    marketing: boolean;
  };
  push: {
    travelReminders: boolean;
    documentReminders: boolean;
    newRequirements: boolean;
  };
}

// Travel preferences type
interface TravelPreferences {
  defaultCurrency: string;
  preferredAirlines: string[];
  preferredAccommodations: 'hotel' | 'rental' | 'any';
  petTransportation: 'cabin' | 'cargo' | 'either';
  advanceNotice: number; // days
}

// Mock user data
const MOCK_USER: UserProfile = {
  id: 'user123',
  name: 'John Smith',
  email: 'john@example.com',
  phone: '+1 (555) 123-4567',
  address: '123 Main St, Boston, MA, 02110',
  imageUrl: '/placeholder-user.jpg',
  createdAt: '2024-01-15',
  timeZone: 'America/New_York',
  language: 'en-US'
};

// Mock notification preferences
const MOCK_NOTIFICATIONS: NotificationPreferences = {
  email: {
    travelReminders: true,
    documentReminders: true,
    newRequirements: true,
    marketing: false
  },
  push: {
    travelReminders: true,
    documentReminders: true,
    newRequirements: false
  }
};

// Mock travel preferences
const MOCK_TRAVEL_PREFERENCES: TravelPreferences = {
  defaultCurrency: 'USD',
  preferredAirlines: ['Delta', 'United'],
  preferredAccommodations: 'hotel',
  petTransportation: 'cabin',
  advanceNotice: 60
};

// Settings tabs
type SettingsTab = 'profile' | 'notifications' | 'account' | 'travel';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [user, setUser] = useState<UserProfile>(MOCK_USER);
  const [notifications, setNotifications] = useState<NotificationPreferences>(MOCK_NOTIFICATIONS);
  const [travelPreferences, setTravelPreferences] = useState<TravelPreferences>(MOCK_TRAVEL_PREFERENCES);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle profile form submission
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    
    // Simulate API call
    setTimeout(() => {
      setSaveStatus('success');
      
      // Reset status after a delay
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }, 1000);
  };

  // Handle notification toggle
  const handleNotificationToggle = (
    channel: 'email' | 'push',
    type: keyof NotificationPreferences['email'] | keyof NotificationPreferences['push'],
    value: boolean
  ) => {
    setNotifications(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type]: value
      }
    }));
  };

  // Handle travel preferences change
  const handleTravelPrefChange = (key: keyof TravelPreferences, value: any) => {
    setTravelPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle password change
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    // Basic validation
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      setPasswordSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1000);
  };

  // Delete account
  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Handle account deletion
      alert('Account deletion request submitted.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
      </section>
  
      {/* Settings Interface */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            className={`px-4 py-3 font-medium text-sm ${activeTab === 'profile' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${activeTab === 'notifications' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${activeTab === 'account' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('account')}
          >
            Account
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${activeTab === 'travel' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('travel')}
          >
            Travel Preferences
          </button>
        </div>
  
        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Image */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative h-32 w-32 rounded-full overflow-hidden border border-border">
                    <Image
                      src={user.imageUrl}
                      alt={user.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <button
                    type="button"
                    className="text-sm text-primary hover:text-primary-600 font-medium"
                  >
                    Change Photo
                  </button>
                </div>
  
                {/* Profile Form */}
                <div className="flex-1 space-y-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                      value={user.name}
                      onChange={(e) => setUser({ ...user, name: e.target.value })}
                    />
                  </div>
  
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                      value={user.email}
                      onChange={(e) => setUser({ ...user, email: e.target.value })}
                    />
                  </div>
  
                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-muted-foreground mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                      value={user.phone || ''}
                      onChange={(e) => setUser({ ...user, phone: e.target.value })}
                    />
                  </div>
  
                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-muted-foreground mb-1">
                      Address
                    </label>
                    <textarea
                      id="address"
                      rows={3}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                      value={user.address || ''}
                      onChange={(e) => setUser({ ...user, address: e.target.value })}
                    />
                  </div>
  
                  {/* Time Zone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="timezone" className="block text-sm font-medium text-muted-foreground mb-1">
                        Time Zone
                      </label>
                      <select
                        id="timezone"
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-card"
                        value={user.timeZone}
                        onChange={(e) => setUser({ ...user, timeZone: e.target.value })}
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Paris">Paris (CET)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                      </select>
                    </div>
  
                    <div>
                      <label htmlFor="language" className="block text-sm font-medium text-muted-foreground mb-1">
                        Language
                      </label>
                      <select
                        id="language"
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-card"
                        value={user.language}
                        onChange={(e) => setUser({ ...user, language: e.target.value })}
                      >
                        <option value="en-US">English (US)</option>
                        <option value="en-GB">English (UK)</option>
                        <option value="es-ES">Spanish</option>
                        <option value="fr-FR">French</option>
                        <option value="de-DE">German</option>
                        <option value="ja-JP">Japanese</option>
                      </select>
                    </div>
                  </div>
  
                  {/* Account Info */}
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Member since {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
  
              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                  disabled={saveStatus === 'saving'}
                >
                  {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
  
              {/* Success message */}
              {saveStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                  Your profile has been updated successfully.
                </div>
              )}
            </form>
          )}
  
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Notification Preferences</h2>
              <p className="text-muted-foreground">Manage how you receive notifications from the Global Pet Travel Assistant.</p>
  
              {/* Email Notifications */}
              <div className="space-y-4">
                <h3 className="text-md font-medium">Email Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Travel Reminders</p>
                      <p className="text-sm text-muted-foreground">Receive reminders about upcoming travel dates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={notifications.email.travelReminders}
                        onChange={(e) =>
                          handleNotificationToggle('email', 'travelReminders', e.target.checked)
                        }
                      />
                      <span className="block w-10 h-6 bg-gray-200 rounded-full"></span>
                      <span
                        className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          notifications.email.travelReminders ? 'translate-x-4' : ''
                        }`}
                      ></span>
                    </label>
                  </div>
  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Document Reminders</p>
                      <p className="text-sm text-muted-foreground">Receive reminders for pending document uploads</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={notifications.email.documentReminders}
                        onChange={(e) =>
                          handleNotificationToggle('email', 'documentReminders', e.target.checked)
                        }
                      />
                      <span className="block w-10 h-6 bg-gray-200 rounded-full"></span>
                      <span
                        className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          notifications.email.documentReminders ? 'translate-x-4' : ''
                        }`}
                      ></span>
                    </label>
                  </div>
  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Requirements</p>
                      <p className="text-sm text-muted-foreground">Receive notifications for new requirements</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={notifications.email.newRequirements}
                        onChange={(e) =>
                          handleNotificationToggle('email', 'newRequirements', e.target.checked)
                        }
                      />
                      <span className="block w-10 h-6 bg-gray-200 rounded-full"></span>
                      <span
                        className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          notifications.email.newRequirements ? 'translate-x-4' : ''
                        }`}
                      ></span>
                    </label>
                  </div>
  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Marketing</p>
                      <p className="text-sm text-muted-foreground">Receive promotional and marketing emails</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={notifications.email.marketing}
                        onChange={(e) =>
                          handleNotificationToggle('email', 'marketing', e.target.checked)
                        }
                      />
                      <span className="block w-10 h-6 bg-gray-200 rounded-full"></span>
                      <span
                        className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          notifications.email.marketing ? 'translate-x-4' : ''
                        }`}
                      ></span>
                    </label>
                  </div>
                </div>
              </div>
  
              {/* Push Notifications */}
              <div className="space-y-4">
                <h3 className="text-md font-medium">Push Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Travel Reminders</p>
                      <p className="text-sm text-muted-foreground">Receive reminders about upcoming travel dates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={notifications.push.travelReminders}
                        onChange={(e) =>
                          handleNotificationToggle('push', 'travelReminders', e.target.checked)
                        }
                      />
                      <span className="block w-10 h-6 bg-gray-200 rounded-full"></span>
                      <span
                        className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          notifications.push.travelReminders ? 'translate-x-4' : ''
                        }`}
                      ></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
  
          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Account</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Manage your account settings and security</p>
                </div>
  
                {/* Password Change */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium">Change Password</h3>
                  <p className="text-sm text-muted-foreground">You can update your account password here</p>
                  <button className="text-primary font-medium">Change Password</button>
                </div>
  
                {/* Delete Account */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-red-600">Delete Account</h3>
                  <p className="text-sm text-red-500">This action cannot be undone</p>
                  <button className="text-red-600 font-medium">Delete Account</button>
                </div>
              </div>
            </div>
          )}
  
          {/* Travel Tab */}
          {activeTab === 'travel' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Travel Preferences</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Set your travel preferences</p>
                </div>
                <div>
                  <h3 className="text-md font-medium">Preferred Airline</h3>
                  <select
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    value={user.preferredAirline || ''}
                    onChange={(e) => setUser({ ...user, preferredAirline: e.target.value })}
                  >
                    <option value="">Select Airline</option>
                    <option value="airline1">Airline 1</option>
                    <option value="airline2">Airline 2</option>
                    <option value="airline3">Airline 3</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}  
                                

