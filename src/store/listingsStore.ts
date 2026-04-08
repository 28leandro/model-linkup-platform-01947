import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ListingType = 'vehicles' | 'real-estate' | 'services';
export type RealEstateType = 'sale' | 'rent';

export interface Listing {
  id: string;
  title: string;
  rating: number;
  location: string;
  type: ListingType;
  category: string;
  description?: string;
  images: string[];
  phone?: string;
  price?: number;
  currency?: string;
  user_id?: string; // ID do usuário que criou o anúncio
  created_at?: string; // Data de criação do anúncio
  // Geolocalização
  latitude?: number;
  longitude?: number;
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
  updateListing: (id: string, listing: Partial<Omit<Listing, 'id'>>) => void;
  deleteListing: (id: string) => void;
}

export const useListingsStore = create<ListingsState>()(
  persist(
    (set) => ({
  listings: [
    {
      id: "1",
      title: "Toyota Hilux 2019 4x4",
      rating: 4.5,
      location: "Asunción, Paraguay",
      type: "vehicles" as ListingType,
      category: "carros",
      images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&q=80"],
      price: 180000000,
      year: 2019,
      mileage: 65000,
      brand: "Toyota",
      model: "Hilux",
      description: "Camioneta en excelente estado, único dueño, motor diesel",
      latitude: -25.2637,
      longitude: -57.5759
    },
    {
      id: "2",
      title: "Casa 3 Dormitorios - Fernando de la Mora",
      rating: 5,
      location: "Fernando de la Mora, Paraguay",
      type: "real-estate" as ListingType,
      category: "casa",
      images: [
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
        "https://images.unsplash.com/photo-1568605114967-8130f3a36594?w=500&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=500&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=500&q=80"
      ],
      price: 450000000,
      realEstateType: "sale" as RealEstateType,
      bedrooms: 3,
      bathrooms: 2,
      area: 180,
      description: "Casa amplia con patio y garaje para 2 vehículos",
      latitude: -25.3194,
      longitude: -57.5428
    },
    {
      id: "3",
      title: "Servicio de Electricista Profesional",
      rating: 4.8,
      location: "Ciudad del Este, Paraguay",
      type: "services" as ListingType,
      category: "eletricista",
      images: ["https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=500&q=80"],
      price: 250000,
      availability: "Lunes a Sábado",
      description: "Servicios eléctricos residenciales y comerciales",
      latitude: -25.5095,
      longitude: -54.6161
    },
    {
      id: "4",
      title: "Departamento 2 Habitaciones - Alquiler",
      rating: 4.2,
      location: "Asunción, Paraguay",
      type: "real-estate" as ListingType,
      category: "apartamento",
      images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80"],
      price: 2500000,
      realEstateType: "rent" as RealEstateType,
      bedrooms: 2,
      bathrooms: 1,
      area: 65,
      description: "Departamento moderno en zona céntrica",
      latitude: -25.2823,
      longitude: -57.6350
    },
    {
      id: "5",
      title: "Terreno 500m² - Luque",
      rating: 4.0,
      location: "Luque, Paraguay",
      type: "real-estate" as ListingType,
      category: "terreno",
      images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&q=80"],
      price: 120000000,
      realEstateType: "sale" as RealEstateType,
      area: 500,
      description: "Terreno ubicado en zona residencial",
      latitude: -25.2667,
      longitude: -57.4833
    },
    {
      id: "6",
      title: "Honda CB 250 - 2020",
      rating: 4.3,
      location: "Encarnación, Paraguay",
      type: "vehicles" as ListingType,
      category: "motos",
      images: ["https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&q=80"],
      price: 18000000,
      year: 2020,
      mileage: 12000,
      brand: "Honda",
      model: "CB 250",
      description: "Moto en perfectas condiciones, poco kilometraje",
      latitude: -27.3340,
      longitude: -55.8658
    },
    {
      id: "7",
      title: "Servicio de Plomería 24/7",
      rating: 4.9,
      location: "San Lorenzo, Paraguay",
      type: "services" as ListingType,
      category: "plomeria",
      images: ["https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=500&q=80"],
      price: 200000,
      availability: "Disponible 24 horas",
      description: "Reparaciones de urgencia y mantenimiento",
      latitude: -25.3400,
      longitude: -57.5089
    },
    {
      id: "8",
      title: "Oficina Comercial - Alquiler",
      rating: 4.6,
      location: "Asunción Centro, Paraguay",
      type: "real-estate" as ListingType,
      category: "comercial",
      images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80"],
      price: 4000000,
      realEstateType: "rent" as RealEstateType,
      area: 45,
      description: "Oficina equipada en edificio moderno",
      latitude: -25.2820,
      longitude: -57.6362
    }
  ],
  addListing: (newListing) => 
    set((state) => ({
      listings: [...state.listings, { ...newListing, id: String(state.listings.length + 1) }]
    })),
  updateListing: (id, updatedData) =>
    set((state) => ({
      listings: state.listings.map((listing) =>
        listing.id === id ? { ...listing, ...updatedData } : listing
      )
    })),
  deleteListing: (id) =>
    set((state) => ({
      listings: state.listings.filter((listing) => listing.id !== id)
    })),
}),
    {
      name: 'listings-storage',
    }
  )
);