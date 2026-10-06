import './AdminVouchers.css';
import React, { useState, useEffect, useMemo } from 'react';

// Modular Sub-Components
import SwitchToggle from './components/SwitchToggle';
import VoucherToast from './components/VoucherToast';
import VoucherHeader from './components/VoucherHeader';
import VoucherStatsCards from './components/VoucherStatsCards';
import VoucherFilterBar from './components/VoucherFilterBar';
import VoucherTable from './components/VoucherTable';
import VoucherModal from './components/VoucherModal';

// Re-export SwitchToggle for backward compatibility
export { SwitchToggle };

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, expired: 0, totalUsed: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedCode, setCopiedCode] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    discountType: 'percentage',
    discountValue: 10,
    minSpend: 0,
    maxDiscount: '',
    usageLimit: '',
    startDate: '',
    endDate: '',
    isActive: true
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Vouchers from API
  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('atelier_admin_token');
      const res = await fetch('/api/vouchers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setVouchers(data.vouchers || []);
        if (data.stats) setStats(data.stats);
      } else {
        showToast(data.message || 'Failed to load vouchers', 'error');
      }
    } catch (err) {
      console.error('Fetch vouchers error:', err);
      showToast('Could not connect to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  // Today in Perth format (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Perth' });
  }, []);

  // Filter vouchers
  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => {
      const q = search.trim().toLowerCase();
      const matchSearch = !q || (
        v.code.toLowerCase().includes(q) ||
        v.name.toLowerCase().includes(q)
      );

      let matchStatus = true;
      if (statusFilter === 'active') {
        matchStatus = v.computedStatus === 'active';
      } else if (statusFilter === 'inactive') {
        matchStatus = v.computedStatus === 'inactive';
      } else if (statusFilter === 'expired') {
        matchStatus = v.computedStatus === 'expired';
      }

      return matchSearch && matchStatus;
    });
  }, [vouchers, search, statusFilter]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingVoucher(null);
    setFormError('');
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    const endStr = nextMonth.toLocaleDateString('en-CA', { timeZone: 'Australia/Perth' });

    setFormData({
      code: '',
      name: '',
      discountType: 'percentage',
      discountValue: 10,
      minSpend: 0,
      maxDiscount: '',
      usageLimit: '',
      startDate: todayStr,
      endDate: endStr,
      isActive: true
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (voucher) => {
    setEditingVoucher(voucher);
    setFormError('');
    setFormData({
      code: voucher.code,
      name: voucher.name,
      discountType: voucher.discountType || 'percentage',
      discountValue: voucher.discountValue,
      minSpend: voucher.minSpend || 0,
      maxDiscount: voucher.maxDiscount || '',
      usageLimit: voucher.usageLimit || '',
      startDate: voucher.startDate || todayStr,
      endDate: voucher.endDate || '',
      isActive: voucher.isActive
    });
    setIsModalOpen(true);
  };

  // Generate Random Code
  const handleGenerateCode = () => {
    const prefixes = ['NAILS', 'FASHION', 'AURA', 'VIP', 'BEAUTY', 'SPECIAL'];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(10 + Math.random() * 90);
    setFormData(prev => ({ ...prev, code: `${p}${num}` }));
  };

  // Live duplicate check against current list
  const isDuplicateCode = useMemo(() => {
    const clean = formData.code.trim().toUpperCase();
    if (!clean) return false;
    return vouchers.some(v =>
      v.code.toUpperCase() === clean &&
      (!editingVoucher || Number(v.id) !== Number(editingVoucher.id))
    );
  }, [formData.code, vouchers, editingVoucher]);

  // Submit Modal Form (Create / Edit)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError('');

    const cleanCode = formData.code.trim().toUpperCase();
    if (!cleanCode) {
      setFormError('Please enter a voucher code.');
      return;
    }

    if (!formData.name.trim()) {
      setFormError('Please enter a promotion name.');
      return;
    }

    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      setFormError('Please enter a valid discount amount greater than 0.');
      return;
    }

    if (formData.discountType === 'percentage' && Number(formData.discountValue) > 100) {
      setFormError('Percentage discount cannot exceed 100%.');
      return;
    }

    if (!formData.endDate) {
      setFormError('Please specify an expiration date.');
      return;
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      setFormError('Expiration date cannot be earlier than start date.');
      return;
    }

    if (isDuplicateCode) {
      setFormError(`Voucher code "${cleanCode}" already exists. Please pick a unique code.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        code: cleanCode,
        name: formData.name.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minSpend: formData.minSpend ? Number(formData.minSpend) : 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit, 10) : null,
        startDate: formData.startDate || todayStr,
        endDate: formData.endDate,
        isActive: formData.isActive
      };

      const url = editingVoucher ? `/api/vouchers/${editingVoucher.id}` : '/api/vouchers';
      const method = editingVoucher ? 'PUT' : 'POST';

      const token = localStorage.getItem('atelier_admin_token');
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        showToast(
          editingVoucher
            ? `Voucher "${cleanCode}" updated successfully!`
            : `New voucher "${cleanCode}" created successfully!`,
          'success'
        );
        setIsModalOpen(false);
        fetchVouchers();
      } else {
        setFormError(data.message || 'Operation failed.');
      }
    } catch (err) {
      console.error('Submit voucher error:', err);
      setFormError('Server error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active State
  const handleToggle = async (voucher) => {
    try {
      const token = localStorage.getItem('atelier_admin_token');
      const res = await fetch(`/api/vouchers/${voucher.id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          `Voucher "${voucher.code}" is now ${data.voucher.isActive ? 'ACTIVE' : 'INACTIVE'}`,
          'success'
        );
        setVouchers(prev => prev.map(v => v.id === voucher.id ? { ...v, isActive: data.voucher.isActive, computedStatus: data.voucher.computedStatus } : v));
        if (data.stats) setStats(data.stats);
      } else {
        showToast(data.message || 'Failed to update voucher status', 'error');
      }
    } catch (err) {
      console.error('Toggle voucher error:', err);
      showToast('Could not update status', 'error');
    }
  };

  // Delete voucher
  const handleDelete = async (voucher) => {
    if (!window.confirm(`Are you sure you want to delete voucher "${voucher.code}" (${voucher.name})?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('atelier_admin_token');
      const res = await fetch(`/api/vouchers/${voucher.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Voucher "${voucher.code}" deleted successfully!`, 'success');
        fetchVouchers();
      } else {
        showToast(data.message || 'Failed to delete voucher', 'error');
      }
    } catch (err) {
      console.error('Delete voucher error:', err);
      showToast('Server connection error while deleting voucher', 'error');
    }
  };

  // Manual Trigger Cron Expire Check
  const handleRunCron = async () => {
    try {
      const token = localStorage.getItem('atelier_admin_token');
      const res = await fetch('/api/vouchers/run-cron', { 
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        fetchVouchers();
      }
    } catch (err) {
      console.error('Run cron error:', err);
      showToast('Failed to trigger expiration check', 'error');
    }
  };

  // Copy code to clipboard
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="admin-vouchers-container">
      {/* 1. Toast Notification */}
      <VoucherToast toast={toast} />

      {/* 2. Header Bar */}
      <VoucherHeader
        onRunCron={handleRunCron}
        onRefresh={fetchVouchers}
        onOpenCreate={handleOpenCreate}
        loading={loading}
      />

      {/* 3. 4 Summary Stat Cards */}
      <VoucherStatsCards stats={stats} />

      {/* 4. Filter & Search Bar */}
      <VoucherFilterBar
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* 5. Vouchers Table */}
      <VoucherTable
        loading={loading}
        filteredVouchers={filteredVouchers}
        search={search}
        onOpenCreate={handleOpenCreate}
        onCopyCode={handleCopyCode}
        copiedCode={copiedCode}
        onToggle={handleToggle}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      {/* 6. Modal: Create / Edit Voucher */}
      <VoucherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingVoucher={editingVoucher}
        formData={formData}
        setFormData={setFormData}
        formError={formError}
        isSubmitting={isSubmitting}
        isDuplicateCode={isDuplicateCode}
        onGenerateCode={handleGenerateCode}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
}
