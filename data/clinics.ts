
export type ClinicCategory = 'All' | 'Sapphire FUE' | 'DHI' | 'Celebrity Choice' | 'Robotic';

export const CATEGORIES: ClinicCategory[] = ['All', 'Sapphire FUE', 'DHI', 'Celebrity Choice', 'Robotic'];

export interface Clinic {
  id: string;
  name: string;
  doctor?: string;
  location: string;
  rating: string | number;
  reviews: string | number;
  price: string;
  img: string;
  tags: string[];
  waitTime: string;
  features: string[];
}

export const CLINICS_DATA: Clinic[] = [
  {
    id: 'c0',
    name: "HairMedico",
    doctor: "Dr. Arslan Musbeh",
    location: "Istanbul, TR",
    rating: "9.9",
    reviews: "2.1k",
    price: "€2,200",
    img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600",
    tags: ["Sapphire FUE", "JCI Accredited"],
    waitTime: "3 Weeks",
    features: ["Only 1 Patient/Day", "Doctor Perfoms All"]
  },
  {
    id: 'c1',
    name: "Dr. Ozlem Bicer",
    location: "Istanbul, TR",
    rating: "9.9",
    reviews: "3.2k",
    price: "€3,500",
    img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=600",
    tags: ["Celebrity Choice", "Manual FUE"],
    waitTime: "4 Weeks",
    features: ["Only 1 Patient/Day", "Doctor Perfoms All"]
  },
  {
    id: 'c2',
    name: "Trivellini Clinic",
    location: "Malaga, ES",
    rating: "9.8",
    reviews: "1.8k",
    price: "€6,000",
    img: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600",
    tags: ["Robotic", "VIP"],
    waitTime: "3 Months",
    features: ["Mamba Device", "Long Hair FUE"]
  },
  {
    id: 'c3',
    name: "Smile Hair Clinic",
    location: "Istanbul, TR",
    rating: "9.7",
    reviews: "5.4k",
    price: "€2,390",
    img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600",
    tags: ["Sapphire FUE", "Best Value"],
    waitTime: "1 Week",
    features: ["All-Inclusive Hotel", "Needle-Free Anesthesia"]
  },
  {
    id: 'c4',
    name: "HLC Clinic",
    location: "Ankara, TR",
    rating: "9.8",
    reviews: "2.1k",
    price: "€2.7 / graft",
    img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600",
    tags: ["DHI", "Manual"],
    waitTime: "2 Months",
    features: ["Body Hair Transplant", "Stick and Place"]
  },
   {
    id: 'c5',
    name: "Vera Clinic",
    location: "Istanbul, TR",
    rating: "9.6",
    reviews: "4.2k",
    price: "€2,500",
    img: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=600",
    tags: ["OxyCure", "Award Winning"],
    waitTime: "2 Weeks",
    features: ["Hyperbaric Oxygen", "Lifetime Warranty"]
  }
];
