import { create } from 'zustand';

export interface Listing {
  id: number;
  title: string;
  rating: number; // Rating from 0 to 5
  location: string;
  category: string;
  description?: string;
  images: string[];
  phone?: string;
}

interface ListingsState {
  listings: Listing[];
  addListing: (listing: Omit<Listing, 'id'>) => void;
}

export const useListingsStore = create<ListingsState>((set) => ({
  listings: [
    {
      id: 1,
      title: "Rénovation complète salle de bain",
      rating: 4.5,
      location: "Paris 75001",
      category: "maconnerie",
      images: ["https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500&q=80"]
    },
    {
      id: 2,
      title: "Installation électrique maison",
      rating: 5,
      location: "Paris 75001",
      category: "electricite",
      images: ["https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=500&q=80"]
    },
    {
      id: 3,
      title: "Entretien jardin et taille de haies",
      rating: 4,
      location: "Lyon 69002",
      category: "jardinerie",
      images: ["https://images.unsplash.com/photo-1558904541-efa843a96f01?w=500&q=80"]
    }
  ],
  addListing: (newListing) => 
    set((state) => ({
      listings: [...state.listings, { ...newListing, id: state.listings.length + 1 }]
    })),
}));