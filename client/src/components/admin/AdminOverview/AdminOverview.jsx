import './AdminOverview.css';
import React, { useState, useEffect, useMemo } from 'react';
import { useAdminSocket } from '../../../context/AdminSocketContext';
import { getPerthNow } from '../../../utils/perthTime';
import { getCategoryDisplayName } from '../AdminBookings/AdminBookings';

// Modular Sub-Components
import OverviewFilterBar from './components/OverviewFilterBar';
import OverviewStatCards from './components/OverviewStatCards';
import OverviewBookingsTable from './components/OverviewBookingsTable';
import OverviewPromoCard from './components/OverviewPromoCard';
import OverviewQuickActions from './components/OverviewQuickActions';

const MONTH_OPTIONS = [
  { value: 'all', label: 'All Months' },
  { value: '01', label: '01 - Jan' },
  { value: '02', label: '02 - Feb' },
  { value: '03', label: '03 - Mar' },
  { value: '04', label: '04 - Apr' },
  { value: '05', label: '05 - May' },
  { value: '06', label: '06 - Jun' },
  { value: '07', label: '07 - Jul' },
  { value: '08', label: '08 - Aug' },
  { value: '09', label: '09 - Sep' },
  { value: '10', label: '10 - Oct' },
  { value: '11', label: '11 - Nov' },
  { value: '12', label: '12 - Dec' }
];

const DAY_OPTIONS = [
  { value: 'all', label: 'All Days' },
  ...Array.from({ length: 31 }, (_, i) => {
    const val = String(i + 1).padStart(2, '0');
    return { value: val, label: `Day ${val}` };
  })
];

export function AdminOverview({ setActiveTab, onSelectBooking }) {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [activePromo, setActivePromo] = useState(null);
  const [activePromos, setActivePromos] = useState([]);
  const [periodFilter, setPeriodFilter] = useState('ALL'); // 'ALL' | 'AM' | 'PM'
  const [loading, setLoading] = useState(true);
  const [liveServices, setLiveServices] = useState([]);
  const [liveCategories, setLiveCategories] = useState([]);

  // Compute Today's date in Perth (Western Australia Standard Time)
  const perthNow = useMemo(() => getPerthNow(), []);
  const todayDay = String(perthNow.day).padStart(2, '0');
  const todayMonth = String(perthNow.month).padStart(2, '0');
  const todayYear = String(perthNow.year);

  // Date Filters - Default to TODAY for dashboard and daily statistics
  const [selectedDay, setSelectedDay] = useState(todayDay);
  const [selectedMonth, setSelectedMonth] = useState(todayMonth);
  const [selectedYear, setSelectedYear] = useState(todayYear);

  const { isUnviewed, realtimeBookings } = useAdminSocket();

  // Pagination State - 10 bookings per page
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Dynamically compute available years
  const currentYear = new Date().getFullYear();
  const availableYears = useMemo(() => {
    const yearsSet = new Set([currentYear + 1, currentYear, currentYear - 1, 2026, 2025, 2024]);
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [currentYear]);

  const dayOptions = useMemo(() => {
    return DAY_OPTIONS.map((d) => ({
      value: d.value,
      label: d.value === todayDay ? `${d.label} (Today)` : d.label
    }));
  }, [todayDay]);

  const monthOptions = useMemo(() => {
    return MONTH_OPTIONS.map((m) => ({
      value: m.value,
      label: m.value === todayMonth ? `${m.label} (This Month)` : m.label
    }));
  }, [todayMonth]);

  const yearOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Years' },
      ...availableYears.map((yr) => ({
        value: String(yr),
        label: String(yr) === todayYear ? `${yr} (This Year)` : String(yr)
      }))
    ];
  }, [availableYears, todayYear]);

  // Fetch live services and categories from Neon database
  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.services)) {
          setLiveServices(data.services);
        }
      })
      .catch(() => {});

    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.categories)) {
          setLiveCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  // Sync real-time incoming bookings from WebSocket into overview data
  useEffect(() => {
    if (realtimeBookings.length > 0) {
      loadOverview(true);
    }
  }, [realtimeBookings]);

  // Load Overview Data based on selected date filters
  const loadOverview = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '500' });
      if (selectedDay !== 'all') params.append('day', selectedDay);
      if (selectedMonth !== 'all') params.append('month', selectedMonth);
      if (selectedYear !== 'all') params.append('year', selectedYear);

      const token = localStorage.getItem('atelier_admin_token');
      const [bookingsRes, promoRes] = await Promise.all([
        fetch(`/api/bookings?${params.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/promotions/active')
      ]);

      if (bookingsRes.ok) {
        const bData = await bookingsRes.json();
        setRecentBookings(bData.bookings || []);
        if (bData.stats) setStats(bData.stats);
      }

      if (promoRes.ok) {
        const pData = await promoRes.json();
        if (pData.success) {
          const list = Array.isArray(pData.promotions) && pData.promotions.length > 0
            ? pData.promotions
            : (pData.promotion ? [pData.promotion] : []);
          setActivePromos(list);
          setActivePromo(pData.promotion || list[0] || null);
        } else {
          setActivePromos([]);
          setActivePromo(null);
        }
      }
    } catch (err) {
      console.error('Error loading admin overview:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    loadOverview();
  }, [selectedDay, selectedMonth, selectedYear]);

  // Robust check if booking time is AM or PM
  const isBookingAM = (timeStr) => {
    if (!timeStr) return false;
    const upper = timeStr.toUpperCase();
    if (upper.includes('AM')) return true;
    if (upper.includes('PM')) return false;
    const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
    if (match) {
      return parseInt(match[1], 10) < 12;
    }
    return false;
  };

  const amCount = useMemo(() => {
    return recentBookings.filter(b => isBookingAM(b.time)).length;
  }, [recentBookings]);

  const pmCount = useMemo(() => {
    return recentBookings.filter(b => b.time && !isBookingAM(b.time)).length;
  }, [recentBookings]);

  const allCount = recentBookings.length;

  const filteredBookings = useMemo(() => {
    if (periodFilter === 'AM') {
      return recentBookings.filter(b => isBookingAM(b.time));
    }
    if (periodFilter === 'PM') {
      return recentBookings.filter(b => b.time && !isBookingAM(b.time));
    }
    return recentBookings;
  }, [recentBookings, periodFilter]);

  const handlePeriodChange = (newPeriod) => {
    setPeriodFilter(newPeriod);
    setCurrentPage(1);
  };

  // Compute pagination parameters for appointments table
  const totalAppointments = filteredBookings.length;
  const totalPages = Math.ceil(totalAppointments / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + pageSize);

  const isTodayFiltered = selectedDay === todayDay && selectedMonth === todayMonth && selectedYear === todayYear;
  const hasDateFilter = selectedDay !== 'all' || selectedMonth !== 'all' || selectedYear !== 'all';

  return (
    <div>
      {/* 1. Date Filter & Indicator Bar */}
      <OverviewFilterBar
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        dayOptions={dayOptions}
        monthOptions={monthOptions}
        yearOptions={yearOptions}
        todayDay={todayDay}
        todayMonth={todayMonth}
        todayYear={todayYear}
        isTodayFiltered={isTodayFiltered}
        hasDateFilter={hasDateFilter}
        stats={stats}
        loading={loading}
        onRefresh={() => loadOverview(false)}
        monthOptionsList={MONTH_OPTIONS}
      />

      {/* 2. 5 Core Management KPI Cards */}
      <OverviewStatCards
        stats={stats}
        isTodayFiltered={isTodayFiltered}
        hasDateFilter={hasDateFilter}
        activePromo={activePromo}
        activePromos={activePromos}
        setActiveTab={setActiveTab}
      />

      {/* 3. Main Grid: Recent Bookings & Side Column */}
      <div className="admin-overview-main-grid">
        <OverviewBookingsTable
          isTodayFiltered={isTodayFiltered}
          hasDateFilter={hasDateFilter}
          selectedDay={selectedDay}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          recentBookings={recentBookings}
          loading={loading}
          paginatedBookings={paginatedBookings}
          totalAppointments={totalAppointments}
          totalPages={totalPages}
          safeCurrentPage={safeCurrentPage}
          startIndex={startIndex}
          pageSize={pageSize}
          setCurrentPage={setCurrentPage}
          setActiveTab={setActiveTab}
          onSelectBooking={onSelectBooking}
          isUnviewed={isUnviewed}
          liveServices={liveServices}
          liveCategories={liveCategories}
          getCategoryDisplayName={getCategoryDisplayName}
          periodFilter={periodFilter}
          onPeriodChange={handlePeriodChange}
          allCount={allCount}
          amCount={amCount}
          pmCount={pmCount}
        />

        {/* Side Column: Holiday Promo Highlights & Quick Actions */}
        <div className="admin-overview-side-col">
          <OverviewPromoCard
            activePromo={activePromo}
            activePromos={activePromos}
            setActiveTab={setActiveTab}
          />
          <OverviewQuickActions
            setActiveTab={setActiveTab}
          />
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;
