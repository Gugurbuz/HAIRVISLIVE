
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ScalpAnalysisResult } from '../geminiService';

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
  
  // Layer C: Consent & Contact
  contactMethod?: 'email' | 'whatsapp' | 'anonymous' | null;
  contactValue?: string;
  consentGiven?: boolean;
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
  analysisData?: ScalpAnalysisResult;
  intake?: IntakeData; // Structured progressive profiling data
}

interface LeadContextType {
  leads: LeadData[];
  addLead: (lead: LeadData) => void;
  unlockLead: (id: string) => void;
  updateLeadStatus: (id: string, status: LeadData['status'], bid?: number, proposalDetails?: ProposalDetails) => void;
  getLeadByIdOrEmail: (identifier: string) => LeadData | undefined;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export const LeadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with some mock data so the portal isn't empty on first load
  // In a real app, this would load from a database or localStorage
  const [leads, setLeads] = useState<LeadData[]>([
    {
      id: 'L-8392',
      countryCode: 'GB',
      age: 34,
      gender: 'Male',
      norwoodScale: 'Type 3V',
      estimatedGrafts: '2800 - 3200',
      registrationDate: '2 mins ago',
      timestamp: Date.now() - 120000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop&q=80',
      status: 'AVAILABLE',
      price: 80,
      proposalPrice: 15,
      isUnlocked: false,
      isNegotiable: true,
      patientDetails: {
        fullName: "James Stirling",
        email: "james@example.com",
        phone: "+44 7700 900077",
        consent: true,
        kvkk: true
      },
      intake: {
          timeline: 'ASAP',
          budget: 'Premium',
          location: 'Turkey'
      }
    }
  ]);

  const addLead = (lead: LeadData) => {
    setLeads(prev => [lead, ...prev]);
    // Simulate persist
    console.log("New Lead Saved:", lead);
  };

  const unlockLead = (id: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, isUnlocked: true, status: 'PURCHASED' } : l));
  };

  const updateLeadStatus = (id: string, status: LeadData['status'], bid?: number, proposalDetails?: ProposalDetails) => {
    setLeads(prev => prev.map(l => l.id === id ? { 
        ...l, 
        status, 
        myBid: bid,
        activeProposal: proposalDetails || l.activeProposal
    } : l));
  };

  const getLeadByIdOrEmail = (identifier: string) => {
    const term = identifier.toLowerCase().trim();
    return leads.find(l => 
        l.id.toLowerCase() === term || 
        l.patientDetails?.email.toLowerCase() === term
    );
  };

  return (
    <LeadContext.Provider value={{ leads, addLead, unlockLead, updateLeadStatus, getLeadByIdOrEmail }}>
      {children}
    </LeadContext.Provider>
  );
};

export const useLeads = () => {
  const context = useContext(LeadContext);
  if (!context) throw new Error('useLeads must be used within a LeadProvider');
  return context;
};
