import React, { useEffect, useState } from 'react';
import { Calendar, AlertCircle, Info } from 'lucide-react';

interface DateSelectionStepProps {
  formData: {
    departure_date: string;
    return_date?: string;
    [key: string]: any;
  };
  onChange: (field: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
  isValid: boolean;
  isLoading: boolean;
}

const DateSelectionStep: React.FC<DateSelectionStepProps> = ({
  formData,
  onChange,
  onNext,
  isValid,
  isLoading,
}) => {
  // Local validation state
  const [errors, setErrors] = useState<{
    departure_date?: string;
    return_date?: string;
  }>({});
  
  // Format date string to YYYY-MM-DD for input
  const formatDateForInput = (dateString: string | undefined) => {
    if (!dateString) return '';
    return dateString;
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Validate dates whenever they change
  useEffect(() => {
    const newErrors: {
      departure_date?: string;
      return_date?: string;
    } = {};
    
    // Check departure date is in the future
    if (formData.departure_date) {
      const departureDate = new Date(formData.departure_date);
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Reset time to start of day
      
      if (departureDate < now) {
        newErrors.departure_date = 'Departure date must be in the future';
      }
    }
    
    // Check return date is after departure date
    if (formData.departure_date && formData.return_date) {
      const departureDate = new Date(formData.departure_date);
      const returnDate = new Date(formData.return_date);
      
      if (returnDate <= departureDate) {
        newErrors.return_date = 'Return date must be after departure date';
      }
    }
    
    setErrors(newErrors);
    
    // Update validity status in parent component
    const isFormValid = 
      formData.departure_date && 
      Object.keys(newErrors).length === 0;
      
    // This would be passed from parent
    // setStepValid(isFormValid);
  }, [formData.departure_date, formData.return_date]);

  // Handlers for date selection
  const handleDepartureDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('departure_date', e.target.value);
  };
  
  const handleReturnDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('return_date', e.target.value);
  };
  
  // Toggle for one-way trip
  const [isOneWay, setIsOneWay] = useState(!formData.return_date);
  
  const toggleOneWay = () => {
    if (!isOneWay) {
      // Switching to one-way, remove return date
      onChange('return_date', undefined);
    }
    setIsOneWay(!isOneWay);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Travel Dates</h2>
      <p className="text-muted-foreground mb-6">
        Select the departure and return dates for your pet's travel. These dates will help determine the timing requirements for vaccinations and documents.
      </p>

      {/* Trip type selection */}
      <div className="flex items-center space-x-4 mb-4">
        <label className="text-sm font-medium flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isOneWay}
            onChange={toggleOneWay}
            className="rounded border-border text-primary focus:ring-primary"
          />
          <span>This is a one-way trip (no return date)</span>
        </label>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Departure Date */}
        <div>
          <label htmlFor="departure_date" className="block text-sm font-medium mb-2">
            Departure Date <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
            </div>
            <input
              type="date"
              id="departure_date"
              min={today}
              value={formatDateForInput(formData.departure_date)}
              onChange={handleDepartureDateChange}
              className={`w-full pl-10 pr-4 py-2 border ${
                errors.departure_date 
                  ? 'border-destructive focus:ring-destructive' 
                  : 'border-border focus:ring-primary'
              } rounded-md focus:outline-none focus:ring-1`}
              required
            />
          </div>
          {errors.departure_date && (
            <p className="text-destructive text-sm mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.departure_date}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            The day your pet will depart from the origin country
          </p>
        </div>
        
        {/* Return Date (conditional) */}
        {!isOneWay && (
          <div>
            <label htmlFor="return_date" className="block text-sm font-medium mb-2">
              Return Date
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
              </div>
              <input
                type="date"
                id="return_date"
                min={formData.departure_date || today}
                value={formatDateForInput(formData.return_date)}
                onChange={handleReturnDateChange}
                className={`w-full pl-10 pr-4 py-2 border ${
                  errors.return_date 
                    ? 'border-destructive focus:ring-destructive' 
                    : 'border-border focus:ring-primary'
                } rounded-md focus:outline-none focus:ring-1`}
              />
            </div>
            {errors.return_date && (
              <p className="text-destructive text-sm mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.return_date}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              The day your pet will return from the destination
            </p>
          </div>
        )}
      </div>
      
      {/* Information box */}
      <div className="bg-muted p-4 rounded-lg mt-6">
        <div className="flex items-start">
          <div className="mr-3 mt-1">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-2">Important Date Information</h3>
            <p className="text-sm text-muted-foreground">
              Many countries have specific timing requirements for vaccinations, tests, and documentation. For example:
            </p>
            <ul className="list-disc text-sm text-muted-foreground ml-5 mt-2 space-y-1">
              <li>Rabies vaccinations often need to be given at least 21-30 days before travel</li>
              <li>Health certificates may need to be issued within 10 days of travel</li>
              <li>Some tests must be conducted within specific timeframes</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              The system will use your travel dates to calculate the deadlines for all required documentation.
            </p>
          </div>
        </div>
      </div>

      {/* Overall validation message */}
      {!isValid && !formData.departure_date && (
        <p className="text-destructive text-sm mt-4 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          Departure date is required to proceed
        </p>
      )}
    </div>
  );
};

export default DateSelectionStep;

"use client";

import React, { useState, useEffect } from 'react';
import { TravelPlanFormData } from '../page';

// Props interface for DateSelectionStep
interface DateSelectionStepProps {
  formData: TravelPlanFormData;
  updateFormData: (fieldName: string, value: any) => void;
  errors: Record<string, string>;
}

// The minimum number of days in advance required for booking
const MIN_ADVANCE_DAYS = 30;

const DateSelectionStep: React.FC<DateSelectionStepProps> = ({
  formData,
  updateFormData,
  errors
}) => {
  const [dateErrors, setDateErrors] = useState<Record<string, string>>({});

  // Calculate minimum allowed dates
  const today = new Date();
  const minDepartureDate = new Date();
  minDepartureDate.setDate(today.getDate() + MIN_ADVANCE_DAYS);
  
  // Format date for the input field
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Format the minimum departure date for display
  const formattedMinDepartureDate = minDepartureDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Handle departure date change
  const handleDepartureDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDepartureDate = e.target.value;
    updateFormData('departureDate', newDepartureDate);
    
    // Validate the new departure date
    validateDates(newDepartureDate, formData.returnDate);
  };

  // Handle return date change
  const handleReturnDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newReturnDate = e.target.value ? e.target.value : null;
    updateFormData('returnDate', newReturnDate);
    
    // Validate return date against the departure date
    validateDates(formData.departureDate, newReturnDate);
  };

  // Clear return date
  const handleClearReturnDate = () => {
    updateFormData('returnDate', null);
    
    // Clear any return date errors
    setDateErrors(prev => {
      const updated = { ...prev };
      delete updated.returnDate;
      return updated;
    });
  };

  // Validate both dates
  const validateDates = (departureDate: string, returnDate: string | null) => {
    const errors: Record<string, string> = {};
    
    // Validate departure date
    if (departureDate) {
      const departureTime = new Date(departureDate).getTime();
      const minDepartureTime = minDepartureDate.getTime();
      
      if (departureTime < minDepartureTime) {
        errors.departureDate = `Departure date must be at least ${MIN_ADVANCE_DAYS} days in the future (${formattedMinDepartureDate} or later)`;
      }
    }
    
    // Validate return date if provided
    if (departureDate && returnDate) {
      const departureTime = new Date(departureDate).getTime();
      const returnTime = new Date(returnDate).getTime();
      
      if (returnTime <= departureTime) {
        errors.returnDate = 'Return date must be after the departure date';
      }
    }
    
    setDateErrors(errors);
  };

  // Validate dates when component mounts or when dates change
  useEffect(() => {
    validateDates(formData.departureDate, formData.returnDate);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Travel Dates</h2>
      <p className="text-muted-foreground">
        Select the dates for your pet's travel. Some requirements may have specific timeframes.
      </p>

      {/* Combined error messaging */}
      {(dateErrors.departureDate || dateErrors.returnDate || errors.departureDate) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {dateErrors.departureDate || dateErrors.returnDate || errors.departureDate}
        </div>
      )}

      {/* Date Selection Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Departure Date */}
        <div>
          <label htmlFor="departureDate" className="block text-sm font-medium text-foreground mb-1">
            Departure Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="departureDate"
            className={`w-full px-3 py-2 border ${
              dateErrors.departureDate || errors.departureDate 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-border focus:ring-primary'
            } rounded-md focus:outline-none focus:ring-1 bg-card`}
            value={formData.departureDate}
            onChange={handleDepartureDateChange}
            min={formatDateForInput(minDepartureDate)}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Must be at least {MIN_ADVANCE_DAYS} days in the future to allow for paperwork processing
          </p>
        </div>

        {/* Return Date (Optional) */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="returnDate" className="block text-sm font-medium text-foreground">
              Return Date <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            {formData.returnDate && (
              <button
                type="button"
                onClick={handleClearReturnDate}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
          <input
            type="date"
            id="returnDate"
            className={`w-full px-3 py-2 border ${
              dateErrors.returnDate ? 'border-red-300 focus:ring-red-500' : 'border-border focus:ring-primary'
            } rounded-md focus:outline-none focus:ring-1 bg-card`}
            value={formData.returnDate || ''}
            onChange={handleReturnDateChange}
            min={formData.departureDate || undefined}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            For round trips only. Must be after the departure date.
          </p>
        </div>
      </div>

      {/* Travel Duration Display */}
      {formData.departureDate && !dateErrors.departureDate && (
        <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mt-4">
          <h3 className="font-medium text-primary-700 mb-2">Travel Information</h3>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <span className="font-medium text-primary-700 w-28">Departure:</span>
              <span className="text-primary-800">
                {new Date(formData.departureDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            {formData.returnDate && !dateErrors.returnDate && (
              <>
                <div className="flex items-center">
                  <span className="font-medium text-primary-700 w-28">Return:</span>
                  <span className="text-primary-800">
                    {new Date(formData.returnDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-primary-700 w-28">Duration:</span>
                  <span className="text-primary-800">
                    {Math.ceil((new Date(formData.returnDate).getTime() - new Date(formData.departureDate).getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </>
            )}
          </div>
          
          <p className="mt-3 text-sm text-primary-700">
            <span className="font-medium">Note:</span> Some requirements need to be completed within specific timeframes before travel.
          </p>
        </div>
      )}

      {/* Date Selection Information */}
      <div className="bg-muted rounded-lg p-4 mt-6">
        <h3 className="font-medium mb-2">Important Date Information</h3>
        <ul className="list-disc text-sm text-muted-foreground ml-5 space-y-1">
          <li>The {MIN_ADVANCE_DAYS}-day minimum advance booking is required for most international pet travel.</li>
          <li>Some countries may require more lead time for specific tests or quarantine procedures.</li>
          <li>Health certificates typically must be issued within 10 days of travel.</li>
          <li>Some vaccinations may need to be administered a certain number of days before travel.</li>
          <li>For round trips, return requirements may differ from the outbound journey.</li>
        </ul>
        <p className="text-sm text-muted-foreground mt-2">
          After selecting your dates, we'll customize the timeline for completing your pet's travel requirements.
        </p>
      </div>
    </div>
  );
};

export default DateSelectionStep;

