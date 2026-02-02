import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ScalpAnalysisResult } from '../geminiService';
import { supabase } from '../lib/supabase';

export type ClinicTier = 'BASIC' | 'PROFESSIONAL' | 'PREMIUM' | 'ENTERPRISE' | 'CoE' | 'Free';
export type Suitability = 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR' | 'NOT_SUITABLE' | 'suitable' | 'borderline' | 'not_suitable';
export type DonorBand = 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'LIMITED' | 'POOR';

export interface ClinicResponse {
  clinicId: string;
  leadId: string;
  response: 'INTERESTED' | 'NOT_INTERESTED' | 'PROPOSAL_SENT';
  notes?: string;
  proposalDetails?: ProposalDetails;
  timestamp: number;
  opinion?: string;
  approach?: string;
  proposal?: Record<string, unknown>;
}

export interface ProposalDetails {
  clinicName: string;
  price: number;
  currency: string;
  treatmentType: string;
  packageTier: string;
  inclusions: {
    hotel: string;
    flight: boolean;
    transfer: boolean;
    nights: number;
  };
  message?: string;
  timestamp: number;
}

export interface IntakeData {
  // Layer A: Calibration
  ageRange?: string;
  gender?: string;
  history?: string;
  goal?: string;
  expectation?: string;

  // Layer B: Optimization
  timeline?: string;
  budget?: string;
  location?: string;
  meds?: string;

  // Layer C: Consent & OAuth
  consent?: boolean;
  kvkk?: boolean;
}

export interface LeadData {
  id: string;
  countryCode: string;
  age: number;
  gender: 'Male' | 'Female';
  norwoodScale: string;
  estimatedGrafts: string;
  registrationDate: string;
  timestamp: number;
  thumbnailUrl: string;
  status: 'AVAILABLE' | 'PURCHASED' | 'NEGOTIATING';
  price: number;
  proposalPrice: number;
  isUnlocked: boolean;
  myBid?: number;
  activeProposal?: ProposalDetails;
  patientDetails?: {
    fullName: string;
    phone: string;
    email: string;
    consent: boolean;
    kvkk: boolean;
    gender?: string;
    age?: string;
    lossDuration?: string;
    previousTransplant?: string;
  };
  isNegotiable: boolean;
  analysisData?: ScalpAnalysisResult & { simulation_image?: string };
  intake?: IntakeData;
  name?: string;
  email?: string;
  phone?: string;
  concerns?: string[];
  source?: string;
  clinicId?: string;
  scanData?: Record<string, any>;
  metadata?: Record<string, any>;
  suitability?: Suitability;
  donorBand?: DonorBand;
  leadScore?: number;
}

interface LeadContextType {
  leads: LeadData[];
  loading: boolean;
  error: string | null;
  addLead: (lead: LeadData) => Promise<void>;
  unlockLead: (id: string) => Promise<void>;
  updateLeadStatus: (id: string, status: LeadData['status'], bid?: number, proposalDetails?: ProposalDetails) => Promise<void>;
  getLeadByIdOrEmail: (identifier: string) => LeadData | undefined;
  refreshLeads: () => Promise<void>;
  clinicTier: ClinicTier;
  setClinicTier: (tier: ClinicTier) => void;
  submitClinicResponse: (response: ClinicResponse) => Promise<void>;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export const LeadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clinicTier, setClinicTier] = useState<ClinicTier>('BASIC');

  const mapDbLeadToLeadData = (dbLead: any): LeadData => {
    const timeAgo = Math.floor((Date.now() - new Date(dbLead.created_at).getTime()) / 60000);
    const timeString = timeAgo < 60
      ? `${timeAgo} mins ago`
      : timeAgo < 1440
      ? `${Math.floor(timeAgo / 60)} hours ago`
      : `${Math.floor(timeAgo / 1440)} days ago`;

    return {
      id: dbLead.id,
      countryCode: dbLead.country_code || '',
      age: dbLead.age,
      gender: dbLead.gender,
      norwoodScale: dbLead.norwood_scale || '',
      estimatedGrafts: dbLead.estimated_grafts || '',
      registrationDate: timeString,
      timestamp: new Date(dbLead.created_at).getTime(),
      thumbnailUrl: dbLead.thumbnail_url || '',
      status: dbLead.status,
      price: dbLead.price || 0,
      proposalPrice: dbLead.proposal_price || 0,
      isUnlocked: dbLead.is_unlocked || false,
      isNegotiable: dbLead.is_negotiable || false,
      patientDetails: dbLead.patient_details,
      analysisData: dbLead.analysis_data,
      intake: dbLead.intake_data,
      name: dbLead.name,
      email: dbLead.email,
      phone: dbLead.phone,
      concerns: dbLead.concerns || [],
      source: dbLead.source,
      clinicId: dbLead.clinic_id,
      scanData: dbLead.scan_data,
      metadata: dbLead.metadata,
    };
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mappedLeads = (data || []).map(mapDbLeadToLeadData);
      setLeads(mappedLeads);
    } catch (err: any) {
      console.error('Error fetching leads:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();

    const channel = supabase
      .channel('leads_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newLead = mapDbLeadToLeadData(payload.new);
            setLeads(prev => [newLead, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedLead = mapDbLeadToLeadData(payload.new);
            setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
          } else if (payload.eventType === 'DELETE') {
            setLeads(prev => prev.filter(l => l.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addLead = async (lead: LeadData) => {
    try {
      const { error: insertError } = await supabase
        .from('leads')
        .insert({
          country_code: lead.countryCode,
          age: lead.age,
          gender: lead.gender,
          norwood_scale: lead.norwoodScale,
          estimated_grafts: lead.estimatedGrafts,
          thumbnail_url: lead.thumbnailUrl,
          status: lead.status,
          price: lead.price,
          proposal_price: lead.proposalPrice,
          is_unlocked: lead.isUnlocked,
          is_negotiable: lead.isNegotiable,
          patient_details: lead.patientDetails,
          analysis_data: lead.analysisData,
          intake_data: lead.intake,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          concerns: lead.concerns,
          source: lead.source,
          clinic_id: lead.clinicId,
          scan_data: lead.scanData,
          metadata: lead.metadata,
        });

      if (insertError) throw insertError;
    } catch (err: any) {
      console.error('Error adding lead:', err);
      setError(err.message);
      throw err;
    }
  };

  const unlockLead = async (id: string) => {
    try {
      const { error: updateError } = await supabase
        .from('leads')
        .update({ is_unlocked: true, status: 'PURCHASED' })
        .eq('id', id);

      if (updateError) throw updateError;
    } catch (err: any) {
      console.error('Error unlocking lead:', err);
      setError(err.message);
      throw err;
    }
  };

  const updateLeadStatus = async (
    id: string,
    status: LeadData['status'],
    bid?: number,
    proposalDetails?: ProposalDetails
  ) => {
    try {
      const { error: updateError } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', id);

      if (updateError) throw updateError;

      setLeads(prev => prev.map(l => l.id === id ? {
        ...l,
        status,
        myBid: bid,
        activeProposal: proposalDetails || l.activeProposal
      } : l));
    } catch (err: any) {
      console.error('Error updating lead status:', err);
      setError(err.message);
      throw err;
    }
  };

  const getLeadByIdOrEmail = (identifier: string) => {
    const term = identifier.toLowerCase().trim();
    return leads.find(l =>
      l.id.toLowerCase() === term ||
      l.patientDetails?.email.toLowerCase() === term
    );
  };

  const refreshLeads = async () => {
    await fetchLeads();
  };

  const submitClinicResponse = async (response: ClinicResponse) => {
    console.log('Clinic response submitted:', response);
  };

  return (
    <LeadContext.Provider value={{
      leads,
      loading,
      error,
      addLead,
      unlockLead,
      updateLeadStatus,
      getLeadByIdOrEmail,
      refreshLeads,
      clinicTier,
      setClinicTier,
      submitClinicResponse,
    }}>
      {children}
    </LeadContext.Provider>
  );
};

export const useLeads = () => {
  const context = useContext(LeadContext);
  if (!context) throw new Error('useLeads must be used within a LeadProvider');
  return context;
};
