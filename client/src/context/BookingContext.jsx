import React, { createContext, useContext, useState } from 'react';
import { servicesData } from '../data/services';
import { useLanguage } from './LanguageContext';
import { getPerthDateString } from '../utils/perthTime';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const { language, t } = useLanguage();

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    serviceId: servicesData[0].id,
    serviceName: servicesData[0].name_vi,
    servicePrice: servicesData[0].price,
    serviceDuration: servicesData[0].duration,
    date: '',
    time: '',
    fullName: '',
    phone: '',
    notes: '',
    hasDiscount: false
  });

  const openBooking = (preferredServiceId = null) => {
    setError(null);
    let targetService = servicesData[0];
    if (preferredServiceId) {
      const found = servicesData.find(s => s.id === preferredServiceId);
      if (found) targetService = found;
    }

    setFormData(prev => ({
      ...prev,
      serviceId: targetService.id,
      serviceName: language === 'vi' ? targetService.name_vi : targetService.name_en,
      servicePrice: targetService.price,
      serviceDuration: targetService.duration,
      // Default to today's date in Western Australia (Perth) if not chosen
      date: prev.date || getPerthDateString(0)
    }));

    setStep(preferredServiceId ? 2 : 1);
    setIsBookingOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeBooking = () => {
    setIsBookingOpen(false);
    document.body.style.overflow = '';
  };

  const updateFormData = (fields) => {
    setFormData(prev => ({ ...prev, ...fields }));
    if (error) setError(null);
  };

  const resetBooking = () => {
    setStep(1);
    setBookingResult(null);
    setError(null);
    setFormData({
      serviceId: servicesData[0].id,
      serviceName: language === 'vi' ? servicesData[0].name_vi : servicesData[0].name_en,
      servicePrice: servicesData[0].price,
      serviceDuration: servicesData[0].duration,
      date: getPerthDateString(0),
      time: '',
      fullName: '',
      phone: '',
      notes: '',
      hasDiscount: false
    });
  };

  const submitBooking = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const finalNotes = [
        formData.hasDiscount
          ? (language === 'vi' ? '[Ưu đãi 10%: Senior / Student / Morley Galleria Staff]' : '[10% Discount: Senior / Student / Morley Galleria Staff]')
          : '',
        formData.notes.trim()
      ].filter(Boolean).join(' - ');

      const payload = {
        serviceId: formData.serviceId,
        serviceName: formData.serviceName,
        date: formData.date,
        time: formData.time,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        notes: finalNotes,
        language
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || t('booking.errors.general'));
      }

      setBookingResult({
        bookingId: data.bookingId,
        ...formData,
        createdAt: data.data?.createdAt || new Date().toISOString()
      });
      setStep(6);
    } catch (err) {
      console.error('Booking submission error:', err);
      setError(err.message || t('booking.errors.general'));
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Generates and downloads a standard .ics calendar invite
   */
  const downloadICS = () => {
    if (!bookingResult) return;
    const { bookingId, serviceName, date, time } = bookingResult;
    
    // Parse start time (e.g. 2026-09-25 10:30 AM)
    const startTimeParts = time.split(' ');
    const [rawH, rawM] = startTimeParts[0].split(':');
    let hour = parseInt(rawH, 10);
    if (startTimeParts[1] === 'PM' && hour < 12) hour += 12;
    if (startTimeParts[1] === 'AM' && hour === 12) hour = 0;
    
    const formattedHour = String(hour).padStart(2, '0');
    const formattedDate = date.replace(/-/g, '');
    const dtStart = `${formattedDate}T${formattedHour}${rawM}00`;
    
    // Default 1 hour duration
    const endHour = String((hour + 1) % 24).padStart(2, '0');
    const dtEnd = `${formattedDate}T${endHour}${rawM}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Fashion Nails Morley Galleria//Nail Booking//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${bookingId}@fashionnailsmorley.com.au`,
      `SUMMARY:Fashion Nails - ${serviceName}`,
      `DESCRIPTION:Appointment at Fashion Nails Morley Galleria. Booking Reference: ${bookingId}. Please arrive 5 minutes early. 10% Off Seniors, Students & Morley Galleria Staff!`,
      'LOCATION:Morley Galleria Shopping Centre, Morley WA 6062, Australia',
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Fashion-Nails-${bookingId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Creates a pre-filled Google Calendar web link
   */
  const getGoogleCalendarUrl = () => {
    if (!bookingResult) return '#';
    const { bookingId, serviceName, date, time } = bookingResult;
    
    const startTimeParts = time.split(' ');
    const [rawH, rawM] = startTimeParts[0].split(':');
    let hour = parseInt(rawH, 10);
    if (startTimeParts[1] === 'PM' && hour < 12) hour += 12;
    if (startTimeParts[1] === 'AM' && hour === 12) hour = 0;
    
    const formattedHour = String(hour).padStart(2, '0');
    const formattedDate = date.replace(/-/g, '');
    const dtStart = `${formattedDate}T${formattedHour}${rawM}00`;
    const endHour = String((hour + 1) % 24).padStart(2, '0');
    const dtEnd = `${formattedDate}T${endHour}${rawM}00`;

    const title = encodeURIComponent(`Fashion Nails - ${serviceName}`);
    const details = encodeURIComponent(`Appointment at Fashion Nails Morley Galleria. Booking Reference: ${bookingId}. Please arrive 5 minutes early. 10% Off Seniors, Students & Morley Galleria Staff!`);
    const location = encodeURIComponent('Morley Galleria Shopping Centre, Morley WA 6062, Australia');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dtStart}/${dtEnd}&details=${details}&location=${location}`;
  };

  return (
    <BookingContext.Provider
      value={{
        isBookingOpen,
        openBooking,
        closeBooking,
        step,
        setStep,
        formData,
        updateFormData,
        submitBooking,
        isSubmitting,
        error,
        bookingResult,
        resetBooking,
        downloadICS,
        getGoogleCalendarUrl
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
