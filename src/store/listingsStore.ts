import { create } from 'zustand';

export type ListingType = 'vehicles' | 'real-estate' | 'services';
export type RealEstateType = 'sale' | 'rent';

export interface Listing {
  id: number;
  title: string;
  rating: number;
  location: string;
  type: ListingType;
  category: string;
  description?: string;
  images: string[];
  phone?: string;
  price?: number;
  // Campos específicos para veículos
  year?: number;
  mileage?: number;
  brand?: string;
  model?: string;
  // Campos específicos para imóveis
  realEstateType?: RealEstateType;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  // Campos específicos para serviços
  availability?: string;
}

interface ListingsState {
  listings: Listing[];
  addListing: (listing: Omit<Listing, 'id'>) => void;
}

export const useListingsStore = create<ListingsState>((set) => ({
  listings: [
    {
      id: 1,
      title: "Toyota Corolla 2020",
      rating: 4.5,
      location: "São Paulo, SP",
      type: "vehicles" as ListingType,
      category: "carros",
      images: ["https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500&q=80"],
      price: 75000,
      year: 2020,
      mileage: 45000,
      brand: "Toyota",
      model: "Corolla",
      description: "Veículo em excelente estado, único dono, revisões em dia"
    },
    {
      id: 2,
      title: "Apartamento 2 Quartos - Centro",
      rating: 5,
      location: "Rio de Janeiro, RJ",
      type: "real-estate" as ListingType,
      category: "apartamento",
      images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80"],
      price: 350000,
      realEstateType: "sale" as RealEstateType,
      bedrooms: 2,
      bathrooms: 1,
      area: 65,
      description: "Apartamento moderno com vista para a cidade"
    },
    {
      id: 3,
      title: "Serviço de Eletricista Profissional",
      rating: 4.8,
      location: "Belo Horizonte, MG",
      type: "services" as ListingType,
      category: "eletricista",
      images: ["https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=500&q=80"],
      price: 150,
      availability: "Segunda a Sábado",
      description: "Serviços elétricos residenciais e comerciais"
    },
    {
      id: 4,
      title: "Casa 3 Quartos - Aluguel",
      rating: 4.2,
      location: "Curitiba, PR",
      type: "real-estate" as ListingType,
      category: "casa",
      images: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500&q=80"],
      price: 2500,
      realEstateType: "rent" as RealEstateType,
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      description: "Casa espaçosa com quintal e garagem"
    }
  ],
  addListing: (newListing) => 
    set((state) => ({
      listings: [...state.listings, { ...newListing, id: state.listings.length + 1 }]
    })),
}));