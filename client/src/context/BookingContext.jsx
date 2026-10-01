import React, { createContext, useContext, useState, useEffect } from 'react';
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
    serviceName: servicesData[0].name_en,
    serviceCategory: servicesData[0].category || 'biab',
    servicePrice: servicesData[0].price,
    serviceDuration: servicesData[0].duration,
    date: '',
    time: '',
    fullName: '',
    phone: '',
    email: '',
    guests: 1,
    notes: '',
    voucher: '',
    hasDiscount: false
  });

  // Voucher State
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState(null);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);


  // Live services from API
  const [services, setServices] = useState(servicesData);
  const [servicesLoading, setServicesLoading] = useState(true);

  // Live categories from API
  const DEFAULT_CATEGORIES = [
    { id: 'biab', key: 'biab', label: 'Builder Gel - BIAB', name_en: 'Builder Gel - BIAB' },
    { id: 'acrylic', key: 'acrylic', label: 'Acrylic Nails', name_en: 'Acrylic Nails' },
    { id: 'gelx', key: 'gelx', label: 'Gel X Extensions', name_en: 'Gel X Extensions' },
    { id: 'shellac', key: 'shellac', label: 'Shellac & Manicure', name_en: 'Shellac & Manicure' },
    { id: 'pedicure', key: 'pedicure', label: 'Spa Pedicure & Combos', name_en: 'Spa Pedicure & Combos' },
    { id: 'extra', key: 'extra', label: 'Take Off & Repair', name_en: 'Take Off & Repair' }
  ];
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories?active=true');
      const data = await res.json();
      if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
        setCategories(data.categories.map(c => ({
          ...c,
          key: c.id,
          label: c.name || c.name_en || c.label || c.id
        })));
      }
    } catch (err) {
      console.warn('[BookingContext] Failed to fetch categories from API:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Live schedule locks from API (admin locked dates/slots & custom slots)
  const [scheduleLocks, setScheduleLocks] = useState({
    locks: [],
    lockedDates: [],
    lockedSlots: {},
    dateReasons: {},
    slotReasons: {},
    customSlots: {},
    dateHours: {}
  });

  const fetchLocks = async () => {
    try {
      const res = await fetch('/api/schedule/locks');
      const data = await res.json();
      if (data.success) {
        setScheduleLocks({
          locks: data.locks || [],
          lockedDates: data.lockedDates || [],
          lockedSlots: data.lockedSlots || {},
          dateReasons: data.dateReasons || {},
          slotReasons: data.slotReasons || {},
          customSlots: data.customSlots || {},
          dateHours: data.dateHours || {}
        });
      }
    } catch (err) {
      console.warn('[BookingContext] Failed to fetch schedule locks:', err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services?active=true');
      const data = await res.json();
      if (data.success && Array.isArray(data.services) && data.services.length > 0) {
        setServices(data.services);
      }
    } catch (err) {
      console.warn('[BookingContext] Failed to fetch services from API:', err);
    } finally {
      setServicesLoading(false);
    }
  };

  // Fetch live active services, categories, and schedule locks from backend API
  useEffect(() => {
    fetchServices();
    fetchLocks();
    fetchCategories();
  }, []);

  const openBooking = (preferredServiceId = null, extraData = {}) => {
    setError(null);
    fetchServices();
    fetchLocks();
    fetchCategories();
    const activeList = services && services.length > 0 ? services : servicesData;
    let targetService = activeList[0] || servicesData[0];
    if (preferredServiceId) {
      const found = activeList.find(s => s.id === preferredServiceId) || servicesData.find(s => s.id === preferredServiceId);
      if (found) targetService = found;
    }

    const serviceName = targetService.name || targetService.name_en;

    const resolveCategoryDisplayName = (cat) => {
      if (!cat) return '';
      const OFFICIAL_MAP = {
        biab: 'Builder Gel - BIAB',
        shellac: 'Shellac Nails',
        acrylic: 'Acrylic Nails',
        gelx: 'Gel X Extensions',
        sns: 'SNS Dipping',
        polish: 'Nail Polish',
        extra: 'Extra Services'
      };
      const lower = String(cat).toLowerCase().trim();
      if (OFFICIAL_MAP[lower]) return OFFICIAL_MAP[lower];
      const foundCat = (categories || []).find(c => (c.id || c.key || '').toLowerCase() === lower);
      if (foundCat && (foundCat.name_en || foundCat.name || foundCat.label)) {
        return foundCat.name_en || foundCat.name || foundCat.label;
      }
      return cat;
    };

    setFormData(prev => ({
      ...prev,
      serviceId: targetService.id,
      serviceName: serviceName,
      serviceCategory: targetService.category || 'biab',
      servicePrice: targetService.price,
      serviceDuration: targetService.duration,
      // Default to today's date in Western Australia (Perth) if not chosen
      date: prev.date || getPerthDateString(0),
      ...(extraData?.voucher ? { voucher: extraData.voucher } : {})
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
    setFormData(prev => {
      const next = { ...prev, ...fields };
      if (fields.guests !== undefined && fields.guests !== prev.guests && next.voucher) {
        setTimeout(() => {
          applyVoucher(next.voucher, fields.guests);
        }, 0);
      }
      return next;
    });
    if (error) setError(null);
  };

  const resetBooking = () => {
    setStep(1);
    setBookingResult(null);
    setError(null);
    const activeList = services && services.length > 0 ? services : servicesData;
    const initialService = activeList[0] || servicesData[0];
    const serviceName = initialService.name || initialService.name_en;

    const OFFICIAL_MAP = {
      biab: 'Builder Gel - BIAB',
      shellac: 'Shellac Nails',
      acrylic: 'Acrylic Nails',
      gelx: 'Gel X Extensions',
      sns: 'SNS Dipping',
      polish: 'Nail Polish',
      extra: 'Extra Services'
    };
    const catLower = String(initialService.category || '').toLowerCase().trim();
    const initialCatName = OFFICIAL_MAP[catLower] || initialService.category || '';

    setFormData({
      serviceId: initialService.id,
      serviceName: serviceName,
      serviceCategory: initialCatName,
      servicePrice: initialService.price,
      serviceDuration: initialService.duration,
      date: getPerthDateString(0),
      time: '',
      fullName: '',
      phone: '',
      email: '',
      guests: 1,
      notes: '',
      voucher: '',
      hasDiscount: false
    });
    setAppliedVoucher(null);
    setVoucherError(null);
  };

  const applyVoucher = async (codeToApply, overrideGuests = null) => {
    const clean = (codeToApply || formData.voucher || '').trim().toUpperCase();
    if (!clean) {
      setVoucherError('Please enter a voucher code.');
      return false;
    }

    const guestsCount = Number(overrideGuests ?? formData.guests) || 1;
    const baseServicePrice = Number(formData.servicePrice) || 0;
    const totalSubtotal = baseServicePrice * guestsCount;

    setIsApplyingVoucher(true);
    setVoucherError(null);

    try {
      const res = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: clean,
          servicePrice: totalSubtotal,
          bookingDate: formData.date
        })
      });

      const data = await res.json();
      if (data.success && data.valid) {
        setAppliedVoucher(data);
        setFormData(prev => ({
          ...prev,
          voucher: data.voucher.code,
          hasDiscount: false
        }));
        setVoucherError(null);
        return true;
      } else {
        setAppliedVoucher(null);
        setVoucherError(data.message || 'Invalid or expired voucher code.');
        return false;
      }
    } catch (err) {
      console.error('Apply voucher error:', err);
      setVoucherError('Unable to validate voucher right now. Please try again.');
      return false;
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherError(null);
    setFormData(prev => ({ ...prev, voucher: '' }));
  };

  const submitBooking = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const finalNotes = [
        formData.hasDiscount
          ? '[10% Discount: Senior / Student / Morley Galleria Staff]'
          : '',
        formData.notes.trim()
      ].filter(Boolean).join(' - ');

      const guestsCount = Number(formData.guests) || 1;
      const unitPrice = Number(formData.servicePrice) || 0;
      const subtotal = unitPrice * guestsCount;

      let finalPrice = subtotal;
      let originalPrice = subtotal;
      if (appliedVoucher) {
        finalPrice = Number(appliedVoucher.finalPrice);
        originalPrice = Number(appliedVoucher.originalPrice || subtotal);
      } else if (formData.hasDiscount) {
        const discountAmount = Math.round(subtotal * 0.1);
        finalPrice = Math.max(0, subtotal - discountAmount);
        originalPrice = subtotal;
      }

      const catMap = {
        biab: 'Builder Gel - BIAB',
        shellac: 'Shellac Nails',
        acrylic: 'Acrylic Nails',
        gelx: 'Gel X Extensions',
        sns: 'SNS Dipping',
        polish: 'Nail Polish',
        extra: 'Extra Services'
      };
      let resolvedCategory = (formData.serviceCategory || '').trim();
      if (catMap[resolvedCategory.toLowerCase()]) {
        resolvedCategory = catMap[resolvedCategory.toLowerCase()];
      } else {
        const foundCat = (categories || []).find(c => (c.id || c.key || '').toLowerCase() === resolvedCategory.toLowerCase());
        if (foundCat && (foundCat.name_en || foundCat.name || foundCat.label)) {
          resolvedCategory = foundCat.name_en || foundCat.name || foundCat.label;
        }
      }

      const payload = {
        name: formData.fullName.trim(),
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: (formData.email || '').trim(),
        service: formData.serviceName,
        serviceName: formData.serviceName,
        category: resolvedCategory || formData.serviceCategory || '',
        serviceId: formData.serviceId,
        date: formData.date,
        time: formData.time,
        message: finalNotes,
        notes: finalNotes,
        voucher: (formData.voucher || (formData.hasDiscount ? '10% Discount' : '')).trim(),
        guests: guestsCount,
        price: finalPrice,
        originalPrice: originalPrice,
        unitPrice: unitPrice,
        language: 'en'
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
        price: finalPrice,
        originalPrice: originalPrice,
        unitPrice: unitPrice,
        voucher: (appliedVoucher?.voucher?.code || formData.voucher || '').trim(),
        appliedVoucher: appliedVoucher,
        email: (formData.email || '').trim(),
        guests: guestsCount,
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
        services,
        servicesLoading,
        fetchServices,
        categories,
        categoriesLoading,
        fetchCategories,
        scheduleLocks,
        lockedDates: scheduleLocks.lockedDates || [],
        lockedSlots: scheduleLocks.lockedSlots || {},
        dateReasons: scheduleLocks.dateReasons || {},
        slotReasons: scheduleLocks.slotReasons || {},
        customSlots: scheduleLocks.customSlots || {},
        dateHours: scheduleLocks.dateHours || {},
        fetchScheduleLocks: fetchLocks,
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
        appliedVoucher,
        voucherError,
        setVoucherError,
        isApplyingVoucher,
        applyVoucher,
        removeVoucher,
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
