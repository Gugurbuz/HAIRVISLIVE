import React, { useState, useEffect } from 'react';
import {
  Search, Filter, MapPin, Calendar, Activity, Lock, Unlock,
  Eye, ShoppingCart, CreditCard, Star, TrendingUp, AlertCircle
} from 'lucide-react';
import { clinicManagementService, LeadFilters } from '../../lib/clinicManagementService';
import { supabase } from '../../lib/supabase';

interface LeadMarketplaceProps {
  clinicId: string;
  clinicCredits: number;
  onPurchase?: (newCredits: number) => void;
}

export const LeadMarketplace: React.FC<LeadMarketplaceProps> = ({
  clinicId,
  clinicCredits,
  onPurchase,
}) => {
  const [activeTab, setActiveTab] = useState<'available' | 'purchased'>('available');
  const [availableLeads, setAvailableLeads] = useState<any[]>([]);
  const [purchasedLeads, setPurchasedLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  // Filters
  const [filters, setFilters] = useState<LeadFilters>({
    location: '',
    age_min: undefined,
    age_max: undefined,
    norwood_scale: [],
    grafts_min: undefined,
    grafts_max: undefined,
    limit: 20,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (activeTab === 'available') {
      loadAvailableLeads();
    } else {
      loadPurchasedLeads();
    }
  }, [activeTab, filters]);

  const loadAvailableLeads = async () => {
    setLoading(true);
    const { data } = await clinicManagementService.getAvailableLeads(filters);
    if (data) {
      setAvailableLeads(data);
    }
    setLoading(false);
  };

  const loadPurchasedLeads = async () => {
    setLoading(true);
    const { data } = await clinicManagementService.getPurchasedLeads(clinicId);
    if (data) {
      setPurchasedLeads(data);
    }
    setLoading(false);
  };

  const handleLeadClick = async (lead: any) => {
    setSelectedLead(lead);

    if (activeTab === 'available') {
      await clinicManagementService.trackLeadView(clinicId, lead.id);
    }
  };

  const handlePurchase = async () => {
    if (!selectedLead) return;

    const creditsNeeded = selectedLead.price || 65;

    if (clinicCredits < creditsNeeded) {
      alert('Insufficient credits. Please purchase more credits.');
      return;
    }

    setPurchasing(true);

    try {
      const { error } = await clinicManagementService.purchaseLead(
        clinicId,
        selectedLead.id,
        creditsNeeded
      );

      if (!error) {
        setShowPurchaseModal(false);
        setSelectedLead(null);
        loadAvailableLeads();
        onPurchase?.(clinicCredits - creditsNeeded);
      }
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setPurchasing(false);
    }
  };

  const norwoodOptions = ['NW1', 'NW2', 'NW3', 'NW4', 'NW5', 'NW6', 'NW7'];

  return (
    <div className="space-y-6">
      {/* Header with Tabs and Credits */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-6 py-3 rounded-lg text-sm font-bold transition-colors ${
              activeTab === 'available'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingCart size={16} className="inline mr-2" />
            Available Leads
          </button>
          <button
            onClick={() => setActiveTab('purchased')}
            className={`px-6 py-3 rounded-lg text-sm font-bold transition-colors ${
              activeTab === 'purchased'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Unlock size={16} className="inline mr-2" />
            My Leads
          </button>
        </div>

        {/* Credits Display */}
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2">
              <CreditCard size={20} className="text-amber-600" />
              <div>
                <div className="text-xs text-amber-600 font-semibold">Available Credits</div>
                <div className="text-2xl font-black text-amber-900">{clinicCredits}</div>
              </div>
            </div>
          </div>

          <button className="px-6 py-3 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition-colors">
            Buy Credits
          </button>
        </div>
      </div>

      {/* Available Leads Tab */}
      {activeTab === 'available' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-slate-700 font-bold hover:text-slate-900 transition-colors"
            >
              <Filter size={18} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={filters.location || ''}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    placeholder="Country code (e.g., US, UK)"
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Age Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={filters.age_min || ''}
                      onChange={(e) => setFilters({ ...filters, age_min: parseInt(e.target.value) })}
                      placeholder="Min"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <input
                      type="number"
                      value={filters.age_max || ''}
                      onChange={(e) => setFilters({ ...filters, age_max: parseInt(e.target.value) })}
                      placeholder="Max"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Grafts Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={filters.grafts_min || ''}
                      onChange={(e) => setFilters({ ...filters, grafts_min: parseInt(e.target.value) })}
                      placeholder="Min"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <input
                      type="number"
                      value={filters.grafts_max || ''}
                      onChange={(e) => setFilters({ ...filters, grafts_max: parseInt(e.target.value) })}
                      placeholder="Max"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Norwood Scale
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {norwoodOptions.map((nw) => (
                      <button
                        key={nw}
                        onClick={() => {
                          const current = filters.norwood_scale || [];
                          const updated = current.includes(nw)
                            ? current.filter(n => n !== nw)
                            : [...current, nw];
                          setFilters({ ...filters, norwood_scale: updated });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                          filters.norwood_scale?.includes(nw)
                            ? 'bg-teal-500 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {nw}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Leads Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : availableLeads.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500">
                <AlertCircle size={48} className="mx-auto mb-4 opacity-30" />
                <p>No leads available matching your filters</p>
              </div>
            ) : (
              availableLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => handleLeadClick(lead)}
                  className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-teal-300 hover:shadow-lg transition-all cursor-pointer"
                >
                  {/* Lead Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                        <MapPin size={14} />
                        {lead.country_code}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <Calendar size={14} />
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-teal-600">
                        {lead.price || 65}
                      </div>
                      <div className="text-xs text-slate-500 font-semibold">Credits</div>
                    </div>
                  </div>

                  {/* Lead Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Age</span>
                      <span className="font-bold text-slate-900">{lead.age} years</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Norwood Scale</span>
                      <span className="px-2 py-1 bg-slate-100 rounded text-sm font-bold text-slate-900">
                        {lead.norwood_scale}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Estimated Grafts</span>
                      <span className="font-bold text-slate-900">
                        <Activity size={14} className="inline mr-1" />
                        ~{lead.estimated_grafts}
                      </span>
                    </div>

                    {lead.gender && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Gender</span>
                        <span className="font-bold text-slate-900">{lead.gender}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLead(lead);
                      setShowPurchaseModal(true);
                    }}
                    className="w-full mt-6 px-4 py-3 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Lock size={16} />
                    Unlock Full Details
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Purchased Leads Tab */}
      {activeTab === 'purchased' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              My Purchased Leads ({purchasedLeads.length})
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : purchasedLeads.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Unlock size={48} className="mx-auto mb-4 opacity-30" />
                <p>No leads purchased yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {purchasedLeads.map((purchase: any) => {
                  const lead = purchase.lead;
                  return (
                    <div
                      key={purchase.id}
                      className="bg-slate-50 rounded-xl border border-slate-200 p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg mb-2">
                            {lead.name || 'Lead #' + lead.id.slice(0, 8)}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span>
                              <MapPin size={14} className="inline mr-1" />
                              {lead.country_code}
                            </span>
                            <span>{lead.age} years</span>
                            <span>{lead.norwood_scale}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500 mb-1">Purchased</div>
                          <div className="text-sm font-semibold text-slate-900">
                            {new Date(purchase.purchased_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-slate-200">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Email</div>
                          <div className="font-semibold text-slate-900">{lead.email}</div>
                        </div>
                        {lead.phone && (
                          <div>
                            <div className="text-xs text-slate-500 mb-1">Phone</div>
                            <div className="font-semibold text-slate-900">{lead.phone}</div>
                          </div>
                        )}
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Estimated Grafts</div>
                          <div className="font-semibold text-slate-900">~{lead.estimated_grafts}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Credits Spent</div>
                          <div className="font-semibold text-amber-600">{purchase.credits_spent}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Unlock Lead</h3>

            <div className="space-y-4 mb-6">
              <p className="text-slate-600">
                You are about to unlock full contact details for this lead.
              </p>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-amber-900">Cost</span>
                  <span className="text-2xl font-black text-amber-900">
                    {selectedLead.price || 65} Credits
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-700">Your Balance</span>
                  <span className="font-bold text-amber-900">{clinicCredits} Credits</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Location</span>
                  <span className="font-semibold">{selectedLead.country_code}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Age</span>
                  <span className="font-semibold">{selectedLead.age} years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Norwood Scale</span>
                  <span className="font-semibold">{selectedLead.norwood_scale}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Estimated Grafts</span>
                  <span className="font-semibold">~{selectedLead.estimated_grafts}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                disabled={purchasing || clinicCredits < (selectedLead.price || 65)}
                className="flex-1 px-6 py-3 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Unlock size={18} />
                {purchasing ? 'Processing...' : 'Unlock Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
