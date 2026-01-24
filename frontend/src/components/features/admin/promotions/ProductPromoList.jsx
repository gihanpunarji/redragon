import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  MessageSquare
} from 'lucide-react';
import { productPromoAPI } from '../../../../services/api';

const ProductPromoList = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);

  const [formData, setFormData] = useState({
    message: '',
    theme: 'primary',
    color: '#ef4444',
    is_active: 1
  });

  const themeOptions = [
    { name: 'primary', label: 'Primary' },
    { name: 'success', label: 'Success' },
    { name: 'warning', label: 'Warning' },
    { name: 'error', label: 'Error' },
    { name: 'info', label: 'Info' },
    { name: 'redragon', label: 'Redragon' }
  ];

  const colorPresets = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', 
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
  ];

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const response = await productPromoAPI.getAllPromos();
      setPromos(response.data.data || []);
    } catch (error) {
      console.error('Fetch promos error:', error);
      setError('Failed to load promotional messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editingPromo) {
        await productPromoAPI.updatePromo(editingPromo.id, formData);
        setSuccess('Promotional message updated successfully!');
      } else {
        await productPromoAPI.createPromo(formData);
        setSuccess('Promotional message created successfully!');
      }
      
      resetForm();
      setIsModalOpen(false);
      fetchPromos();
    } catch (error) {
      console.error('Submit error:', error);
      setError(error.response?.data?.message || 'Failed to save promotional message');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (promo) => {
    setEditingPromo(promo);
    setFormData({
      message: promo.message,
      theme: promo.theme,
      color: promo.color,
      is_active: promo.is_active
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (promoId) => {
    if (!window.confirm('Are you sure you want to delete this promotional message?')) {
      return;
    }

    try {
      await productPromoAPI.deletePromo(promoId);
      setSuccess('Promotional message deleted successfully!');
      fetchPromos();
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete promotional message');
    }
  };

  const toggleActive = async (promoId, isActive) => {
    try {
      await productPromoAPI.togglePromoActive(promoId, isActive ? 1 : 0);
      setSuccess(`Promotional message ${isActive ? 'activated' : 'deactivated'} successfully!`);
      fetchPromos();
    } catch (error) {
      console.error('Toggle active error:', error);
      setError('Failed to update promotional message status');
    }
  };

  const resetForm = () => {
    setFormData({
      message: '',
      theme: 'primary',
      color: '#ef4444',
      is_active: 1
    });
    setEditingPromo(null);
  };

  const getThemeStyles = (theme) => {
    const themes = {
      primary: { bg: '#f3f4f6', text: '#1f2937', border: '#e5e7eb' },
      success: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
      warning: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
      error: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
      info: { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
      redragon: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' }
    };
    return themes[theme] || themes.primary;
  };

  if (loading && promos.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Promotional Messages</h2>
          <p className="text-gray-600 mt-1">Manage promotional messages displayed on product pages</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add New Promo
        </motion.button>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          >
            {error}
            <button
              onClick={() => setError('')}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg"
          >
            {success}
            <button
              onClick={() => setSuccess('')}
              className="ml-2 text-green-500 hover:text-green-700"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Promotional Messages List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {promos.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No promotional messages yet</h3>
            <p className="text-gray-600 mb-4">Create your first promotional message to attract customers</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Create First Message
            </motion.button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {promos.map((promo) => {
              const themeStyles = getThemeStyles(promo.theme);
              
              return (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {/* Preview */}
                      <div 
                        className="mb-4 p-6 rounded-xl border-2"
                        style={{
                          backgroundColor: themeStyles.bg,
                          color: promo.color,
                          borderColor: themeStyles.border
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: promo.color }}
                          />
                          <p className="text-lg font-bold">{promo.message}</p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-semibold">Theme:</span>{' '}
                          <span className="capitalize">{promo.theme}</span>
                        </div>
                        <div>
                          <span className="font-semibold">Color:</span>{' '}
                          <div className="inline-flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: promo.color }}
                            />
                            {promo.color}
                          </div>
                        </div>
                        <div>
                          <span className="font-semibold">Status:</span>{' '}
                          <span className={promo.is_active ? 'text-green-600' : 'text-red-600'}>
                            {promo.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-6">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleActive(promo.id, !promo.is_active)}
                        className={`p-2 rounded-lg transition-colors ${
                          promo.is_active
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title={promo.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {promo.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(promo)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(promo.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {editingPromo ? 'Edit Promotional Message' : 'Create Promotional Message'}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Form Fields */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Message *
                        </label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          rows={3}
                          placeholder="e.g., 🔥 Limited time offer! Get 50% off on all gaming accessories"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Theme
                        </label>
                        <select
                          value={formData.theme}
                          onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          {themeOptions.map((option) => (
                            <option key={option.name} value={option.name}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Text Color
                        </label>
                        <div className="space-y-3">
                          <div className="flex gap-2 flex-wrap">
                            {colorPresets.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setFormData({ ...formData, color })}
                                className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                                  formData.color === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <input
                            type="color"
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            className="w-full h-10 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="is_active"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                          className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                        />
                        <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">
                          Active
                        </label>
                      </div>
                    </div>

                    {/* Right Column - Preview */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Preview</h4>
                        {(() => {
                          const themeStyles = getThemeStyles(formData.theme);
                          return (
                            <div 
                              className="p-6 rounded-xl border-2 min-h-[200px]"
                              style={{
                                backgroundColor: themeStyles.bg,
                                color: formData.color,
                                borderColor: themeStyles.border
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: formData.color }}
                                />
                                <p className="text-lg font-bold">
                                  {formData.message || 'Your promotional message will appear here...'}
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                      className="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? 'Saving...' : (editingPromo ? 'Update' : 'Create')}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductPromoList;