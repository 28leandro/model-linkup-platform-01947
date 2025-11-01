import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'pt' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    // Header
    'header.map': 'Mapa',
    'header.favorites': 'Favoritos',
    'header.postAd': 'Publicar Anúncio',
    'header.login': 'Entrar',
    
    // Categories
    'categories.title': 'Categorias Principais',
    'categories.vehicles': '🚗 Veículos',
    'categories.vehicles.desc': 'Carros, motos, caminhões',
    'categories.realEstateSale': '🏠 Imóveis - Venda',
    'categories.realEstateSale.desc': 'Casas, apartamentos, terrenos',
    'categories.realEstateRent': '🏘️ Imóveis - Aluguel',
    'categories.realEstateRent.desc': 'Aluguel de imóveis',
    'categories.services': '🛠️ Serviços Diversos',
    'categories.services.desc': 'Prestação de serviços',
    
    // Search
    'search.placeholder': 'Que recherchez-vous ?',
    'search.button': 'Pesquisar',
    'search.emptyTitle': 'Pesquisa vazia',
    'search.emptyDesc': 'Por favor, digite um termo de pesquisa',
    'search.noResults': 'Nenhum resultado',
    'search.noResultsDesc': 'Nenhum anúncio corresponde à sua pesquisa',
    'search.results': 'resultado(s)',
    'search.resultsDesc': 'anúncio(s) correspondem à sua pesquisa',
    
    // Listings
    'listings.recent': 'Anúncios Recentes',
    'listings.searchResults': 'Resultados de pesquisa',
    'listings.noImage': 'Sem imagem',
    
    // Map
    'map.title': 'Mapa de Anúncios',
    'map.subtitle': 'Visualize todos os anúncios disponíveis no mapa',
    'map.selected': 'Anúncio Selecionado',
    'map.onMap': 'Anúncios no Mapa',
    'map.setup': 'Configurar Mapbox',
    'map.setupDesc': 'Para visualizar os anúncios no mapa, você precisa de um token público do Mapbox.',
    'map.token': 'Token Público do Mapbox',
    'map.getToken': 'Obtenha seu token em',
    'map.loadMap': 'Carregar Mapa',
    'map.tokenRequired': 'Token necessário',
    'map.tokenRequiredDesc': 'Por favor, insira o token do Mapbox',
    'map.loadError': 'Erro ao carregar mapa',
    'map.loadErrorDesc': 'Verifique se o token do Mapbox está correto',
    
    // Post Ad
    'postAd.title': 'Publicar Anúncio',
    'postAd.adTitle': 'Título do Anúncio',
    'postAd.adTitlePlaceholder': 'Ex: Toyota Hilux 2019',
    'postAd.category': 'Categoria',
    'postAd.categoryPlaceholder': 'Selecione uma categoria',
    'postAd.categoryVehicles': '🚗 Veículos',
    'postAd.categoryRealEstate': '🏠 Imóveis',
    'postAd.categoryServices': '🛠️ Serviços',
    'postAd.rating': 'Avaliação (1 a 5 estrelas)',
    'postAd.location': 'Localização',
    'postAd.locationPlaceholder': 'Ex: Asunción, Paraguay',
    'postAd.getCurrentLocation': 'Usar Localização Atual',
    'postAd.gettingLocation': 'Obtendo...',
    'postAd.locationHelper': 'Digite o endereço ou use sua localização atual',
    'postAd.phone': 'Telefone',
    'postAd.phonePlaceholder': 'Ex: (021) 123-456',
    'postAd.description': 'Descrição',
    'postAd.descriptionPlaceholder': 'Descreva seu anúncio em detalhes...',
    'postAd.photos': 'Fotos (máx 5)',
    'postAd.addPhoto': 'Adicionar foto',
    'postAd.publish': 'Publicar anúncio',
    'postAd.maxPhotos': 'Erro',
    'postAd.maxPhotosDesc': 'Você não pode adicionar mais de 5 imagens',
    'postAd.published': 'Anúncio publicado!',
    'postAd.publishedDesc': 'Seu anúncio foi publicado com sucesso.',
    
    // Location
    'location.notSupported': 'Geolocalização não suportada',
    'location.notSupportedDesc': 'Seu navegador não suporta geolocalização',
    'location.obtained': 'Localização obtida',
    'location.obtainedDesc': 'Sua localização foi detectada com sucesso',
    'location.errorAddress': 'Erro ao obter endereço',
    'location.errorAddressDesc': 'Não foi possível obter o endereço da localização',
    'location.error': 'Erro ao obter localização',
    'location.errorDesc': 'Não foi possível acessar sua localização. Verifique as permissões do navegador.',
  },
  es: {
    // Header
    'header.map': 'Mapa',
    'header.favorites': 'Favoritos',
    'header.postAd': 'Publicar Anuncio',
    'header.login': 'Ingresar',
    
    // Categories
    'categories.title': 'Categorías Principales',
    'categories.vehicles': '🚗 Vehículos',
    'categories.vehicles.desc': 'Autos, motos, camiones',
    'categories.realEstateSale': '🏠 Inmuebles - Venta',
    'categories.realEstateSale.desc': 'Casas, apartamentos, terrenos',
    'categories.realEstateRent': '🏘️ Inmuebles - Alquiler',
    'categories.realEstateRent.desc': 'Alquiler de inmuebles',
    'categories.services': '🛠️ Servicios Diversos',
    'categories.services.desc': 'Prestación de servicios',
    
    // Search
    'search.placeholder': '¿Qué estás buscando?',
    'search.button': 'Buscar',
    'search.emptyTitle': 'Búsqueda vacía',
    'search.emptyDesc': 'Por favor, ingrese un término de búsqueda',
    'search.noResults': 'Sin resultados',
    'search.noResultsDesc': 'Ningún anuncio coincide con su búsqueda',
    'search.results': 'resultado(s)',
    'search.resultsDesc': 'anuncio(s) coinciden con su búsqueda',
    
    // Listings
    'listings.recent': 'Anuncios Recientes',
    'listings.searchResults': 'Resultados de búsqueda',
    'listings.noImage': 'Sin imagen',
    
    // Map
    'map.title': 'Mapa de Anuncios',
    'map.subtitle': 'Visualice todos los anuncios disponibles en el mapa',
    'map.selected': 'Anuncio Seleccionado',
    'map.onMap': 'Anuncios en el Mapa',
    'map.setup': 'Configurar Mapbox',
    'map.setupDesc': 'Para visualizar los anuncios en el mapa, necesita un token público de Mapbox.',
    'map.token': 'Token Público de Mapbox',
    'map.getToken': 'Obtenga su token en',
    'map.loadMap': 'Cargar Mapa',
    'map.tokenRequired': 'Token necesario',
    'map.tokenRequiredDesc': 'Por favor, ingrese el token de Mapbox',
    'map.loadError': 'Error al cargar mapa',
    'map.loadErrorDesc': 'Verifique que el token de Mapbox sea correcto',
    
    // Post Ad
    'postAd.title': 'Publicar Anuncio',
    'postAd.adTitle': 'Título del Anuncio',
    'postAd.adTitlePlaceholder': 'Ej: Toyota Hilux 2019',
    'postAd.category': 'Categoría',
    'postAd.categoryPlaceholder': 'Seleccione una categoría',
    'postAd.categoryVehicles': '🚗 Vehículos',
    'postAd.categoryRealEstate': '🏠 Inmuebles',
    'postAd.categoryServices': '🛠️ Servicios',
    'postAd.rating': 'Evaluación (1 a 5 estrellas)',
    'postAd.location': 'Ubicación',
    'postAd.locationPlaceholder': 'Ej: Asunción, Paraguay',
    'postAd.getCurrentLocation': 'Usar Ubicación Actual',
    'postAd.gettingLocation': 'Obteniendo...',
    'postAd.locationHelper': 'Ingrese la dirección o use su ubicación actual',
    'postAd.phone': 'Teléfono',
    'postAd.phonePlaceholder': 'Ej: (021) 123-456',
    'postAd.description': 'Descripción',
    'postAd.descriptionPlaceholder': 'Describa su anuncio en detalle...',
    'postAd.photos': 'Fotos (máx 5)',
    'postAd.addPhoto': 'Agregar foto',
    'postAd.publish': 'Publicar anuncio',
    'postAd.maxPhotos': 'Error',
    'postAd.maxPhotosDesc': 'No puede agregar más de 5 imágenes',
    'postAd.published': '¡Anuncio publicado!',
    'postAd.publishedDesc': 'Su anuncio fue publicado con éxito.',
    
    // Location
    'location.notSupported': 'Geolocalización no soportada',
    'location.notSupportedDesc': 'Su navegador no soporta geolocalización',
    'location.obtained': 'Ubicación obtenida',
    'location.obtainedDesc': 'Su ubicación fue detectada con éxito',
    'location.errorAddress': 'Error al obtener dirección',
    'location.errorAddressDesc': 'No se pudo obtener la dirección de la ubicación',
    'location.error': 'Error al obtener ubicación',
    'location.errorDesc': 'No se pudo acceder a su ubicación. Verifique los permisos del navegador.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
