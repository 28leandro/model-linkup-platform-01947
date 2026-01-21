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
    'search.placeholder': 'O que você está procurando?',
    'search.button': 'Pesquisar',
    'search.sortedByProximity': 'ordenados por proximidade',
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
    'postAd.editTitle': 'Editar Anúncio',
    'postAd.adTitle': 'Título do Anúncio',
    'postAd.adTitlePlaceholder': 'Ex: Toyota Hilux 2019',
    'postAd.category': 'Categoria',
    'postAd.categoryPlaceholder': 'Selecione uma categoria',
    'postAd.categoryVehicles': '🚗 Veículos',
    'postAd.categoryRealEstate': '🏠 Imóveis',
    'postAd.categoryServices': '🛠️ Serviços',
    'postAd.price': 'Preço (Gs)',
    'postAd.pricePlaceholder': 'Ex: 50000000',
    'postAd.area': 'Dimensões do Imóvel (m²)',
    'postAd.areaPlaceholder': 'Ex: 150',
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
    'postAd.saveChanges': 'Salvar alterações',
    'postAd.cancel': 'Cancelar',
    'postAd.uploading': 'Enviando...',
    'postAd.maxPhotos': 'Erro',
    'postAd.maxPhotosDesc': 'Você não pode adicionar mais de 5 imagens',
    'postAd.imagesAdded': 'Imagens adicionadas!',
    'postAd.imagesAddedDesc': 'imagem(ns) adicionada(s).',
    'postAd.published': 'Anúncio publicado!',
    'postAd.publishedDesc': 'Seu anúncio foi publicado com sucesso.',
    'postAd.updated': 'Anúncio atualizado!',
    'postAd.updatedDesc': 'Seu anúncio foi atualizado com sucesso.',
    'postAd.error': 'Erro',
    'postAd.authError': 'Você precisa estar logado para publicar anúncios.',
    'postAd.wait': 'Aguarde',
    'postAd.waitDesc': 'As imagens ainda estão sendo processadas.',
    'postAd.validationError': 'Erro de validação',
    'postAd.locationError': 'Por favor, selecione uma localização no mapa.',
    'postAd.categoryError': 'Por favor, selecione uma categoria.',
    'postAd.titleError': 'O título deve ter entre 5 e 100 caracteres.',
    'postAd.descriptionError': 'A descrição deve ter entre 20 e 2000 caracteres.',
    'postAd.uploadError': 'Falha ao enviar imagens. Tente novamente.',
    'postAd.saveError': 'Erro ao salvar',
    'postAd.saveErrorDesc': 'Não foi possível salvar o anúncio. Tente novamente.',
    'postAd.duplicateError': 'Este anúncio já existe.',
    'postAd.fieldError': 'Erro de validação. Verifique os campos.',
    'postAd.permissionError': 'Você não tem permissão para esta ação.',
    'postAd.loading': 'Carregando...',
    
    // Location
    'location.notSupported': 'Geolocalização não suportada',
    'location.notSupportedDesc': 'Seu navegador não suporta geolocalização',
    'location.obtained': 'Localização obtida',
    'location.obtainedDesc': 'Sua localização foi detectada com sucesso',
    'location.errorAddress': 'Erro ao obter endereço',
    'location.errorAddressDesc': 'Não foi possível obter o endereço da localização',
    'location.error': 'Erro ao obter localização',
    'location.errorDesc': 'Não foi possível acessar sua localização. Verifique as permissões do navegador.',
    
    // Listing Detail
    'detail.notFound': 'Anúncio não encontrado',
    'detail.notFoundDesc': 'Este anúncio não existe ou foi removido.',
    'detail.contact': 'Entrar em contato',
    'detail.edit': 'Editar',
    'detail.delete': 'Excluir',
    'detail.deleteConfirm': 'Tem certeza?',
    'detail.deleteDesc': 'Esta ação não pode ser desfeita. O anúncio será excluído permanentemente.',
    'detail.cancel': 'Cancelar',
    'detail.confirmDelete': 'Sim, excluir',
    'detail.deleteError': 'Erro ao excluir',
    'detail.deleteErrorDesc': 'Não foi possível excluir o anúncio.',
    'detail.deleteSuccess': 'Anúncio excluído',
    'detail.deleteSuccessDesc': 'Seu anúncio foi removido com sucesso.',
    'detail.price': 'Preço',
    'detail.area': 'Área',
    
    // Auth
    'auth.required': 'Autenticação necessária',
    'auth.requiredDesc': 'Você precisa estar logado para publicar anúncios.',
    'auth.logout': 'Sair',
    
    // Share
    'share.title': 'Compartilhar',
    'share.copied': 'Link copiado!',
    'share.copiedDesc': 'O link foi copiado para a área de transferência.',
    'share.copyLink': 'Copiar link',
    'share.error': 'Erro ao copiar',
    
    // Favorites
    'favorites.title': 'Seus Favoritos',
    'favorites.empty': 'Você ainda não tem favoritos',
    'favorites.emptyDesc': 'Explore os anúncios e adicione seus favoritos clicando no ícone de coração.',
    'favorites.added': 'Adicionado aos favoritos!',
    'favorites.removed': 'Removido dos favoritos',
    'favorites.loginRequired': 'Faça login para salvar favoritos',
    'favorites.browse': 'Explorar anúncios',
    
    // Common
    'common.backToHome': 'Voltar ao início',
    'common.noListingsInCategory': 'Nenhum anúncio encontrado nesta categoria.',
    
    // Login Dialog
    'login.title': 'Entrar',
    'login.signupTitle': 'Criar Conta',
    'login.description': 'Acesse sua conta',
    'login.signupDescription': 'Crie sua conta',
    'login.name': 'Nome completo',
    'login.namePlaceholder': 'João Silva',
    'login.email': 'Email',
    'login.emailPlaceholder': 'exemplo@email.com',
    'login.password': 'Senha',
    'login.confirmPassword': 'Confirmar senha',
    'login.submit': 'Entrar',
    'login.signupSubmit': 'Criar conta',
    'login.switchToSignup': 'Não tem conta? Criar conta',
    'login.switchToLogin': 'Já tem conta? Entrar',
    'login.invalidEmail': 'Email inválido',
    'login.passwordMin': 'A senha deve ter pelo menos 6 caracteres',
    'login.nameTooShort': 'Nome muito curto',
    'login.passwordMismatch': 'As senhas não coincidem',
    
    // ListingDetail
    'detail.description': 'Descrição',
    'detail.noDescription': 'Sem descrição disponível',
    'detail.bedrooms': 'Quartos',
    'detail.bathrooms': 'Banheiros',
    'detail.rentPerMonth': 'Aluguel/mês',
    
    // Category Page
    'category.vehicles': 'Veículos',
    'category.realEstateSale': 'Imóveis à Venda',
    'category.realEstateRent': 'Imóveis para Alugar',
    'category.services': 'Serviços',
    'category.default': 'Categoria',
    
    // Location errors
    'location.permissionDenied': 'Permissão de localização negada. Verifique as configurações do navegador.',
    'location.unavailable': 'Localização indisponível. Verifique sua conexão ou GPS.',
    'location.timeout': 'Tempo esgotado. Tente novamente.',
    
    // Rating System
    'rating.title': 'Avaliação',
    'rating.vote': 'voto',
    'rating.votes': 'votos',
    'rating.rateThis': 'Avalie este anúncio:',
    'rating.yourRating': 'Sua avaliação:',
    'rating.loginRequired': 'Faça login para avaliar',
    'rating.cannotRateOwn': 'Você não pode avaliar seu próprio anúncio',
    'rating.submitted': 'Avaliação enviada!',
    'rating.updated': 'Avaliação atualizada!',
    'rating.error': 'Erro ao enviar avaliação',
    'rating.ownerMessage': 'Você não pode avaliar seu próprio anúncio',
    'rating.loginToRate': 'Faça login para avaliar este anúncio',
    
    // Filter
    'filter.title': 'Filtros',
    'filter.description': 'Configure os filtros para refinar sua busca',
    'filter.sortBy': 'Ordenar por',
    'filter.selectSort': 'Selecione uma opção',
    'filter.recent': 'Mais recente',
    'filter.oldest': 'Mais antigo',
    'filter.priceAsc': 'Preço crescente',
    'filter.priceDesc': 'Preço decrescente',
    'filter.relevant': 'Pesquisa pertinente',
    'filter.priceRange': 'Faixa de preço (Gs)',
    'filter.minPrice': 'Preço mínimo',
    'filter.maxPrice': 'Preço máximo',
    'filter.yearRange': 'Faixa de ano',
    'filter.minYear': 'Ano mínimo',
    'filter.maxYear': 'Ano máximo',
    'filter.fuelType': 'Tipo de combustível',
    'filter.selectFuel': 'Selecione o combustível',
    'filter.allFuels': 'Todos',
    'filter.gasoline': 'Gasolina',
    'filter.diesel': 'Diesel',
    'filter.electric': 'Elétrico',
    'filter.apply': 'Aplicar filtros',
    'filter.clear': 'Limpar filtros',
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
    'search.sortedByProximity': 'ordenados por proximidad',
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
    'postAd.editTitle': 'Editar Anuncio',
    'postAd.adTitle': 'Título del Anuncio',
    'postAd.adTitlePlaceholder': 'Ej: Toyota Hilux 2019',
    'postAd.category': 'Categoría',
    'postAd.categoryPlaceholder': 'Seleccione una categoría',
    'postAd.categoryVehicles': '🚗 Vehículos',
    'postAd.categoryRealEstate': '🏠 Inmuebles',
    'postAd.categoryServices': '🛠️ Servicios',
    'postAd.price': 'Precio (Gs)',
    'postAd.pricePlaceholder': 'Ej: 50000000',
    'postAd.area': 'Dimensiones del Inmueble (m²)',
    'postAd.areaPlaceholder': 'Ej: 150',
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
    'postAd.saveChanges': 'Guardar cambios',
    'postAd.cancel': 'Cancelar',
    'postAd.uploading': 'Enviando...',
    'postAd.maxPhotos': 'Error',
    'postAd.maxPhotosDesc': 'No puede agregar más de 5 imágenes',
    'postAd.imagesAdded': '¡Imágenes agregadas!',
    'postAd.imagesAddedDesc': 'imagen(es) agregada(s).',
    'postAd.published': '¡Anuncio publicado!',
    'postAd.publishedDesc': 'Su anuncio fue publicado con éxito.',
    'postAd.updated': '¡Anuncio actualizado!',
    'postAd.updatedDesc': 'Su anuncio fue actualizado con éxito.',
    'postAd.error': 'Error',
    'postAd.authError': 'Debe iniciar sesión para publicar anuncios.',
    'postAd.wait': 'Aguarde',
    'postAd.waitDesc': 'Las imágenes aún se están procesando.',
    'postAd.validationError': 'Error de validación',
    'postAd.locationError': 'Por favor, seleccione una ubicación en el mapa.',
    'postAd.categoryError': 'Por favor, seleccione una categoría.',
    'postAd.titleError': 'El título debe tener entre 5 y 100 caracteres.',
    'postAd.descriptionError': 'La descripción debe tener entre 20 y 2000 caracteres.',
    'postAd.uploadError': 'Fallo al enviar imágenes. Intente nuevamente.',
    'postAd.saveError': 'Error al guardar',
    'postAd.saveErrorDesc': 'No se pudo guardar el anuncio. Intente nuevamente.',
    'postAd.duplicateError': 'Este anuncio ya existe.',
    'postAd.fieldError': 'Error de validación. Verifique los campos.',
    'postAd.permissionError': 'No tiene permiso para esta acción.',
    'postAd.loading': 'Cargando...',
    
    // Location
    'location.notSupported': 'Geolocalización no soportada',
    'location.notSupportedDesc': 'Su navegador no soporta geolocalización',
    'location.obtained': 'Ubicación obtenida',
    'location.obtainedDesc': 'Su ubicación fue detectada con éxito',
    'location.errorAddress': 'Error al obtener dirección',
    'location.errorAddressDesc': 'No se pudo obtener la dirección de la ubicación',
    'location.error': 'Error al obtener ubicación',
    'location.errorDesc': 'No se pudo acceder a su ubicación. Verifique los permisos del navegador.',
    
    // Listing Detail
    'detail.notFound': 'Anuncio no encontrado',
    'detail.notFoundDesc': 'Este anuncio no existe o fue eliminado.',
    'detail.contact': 'Contactar',
    'detail.edit': 'Editar',
    'detail.delete': 'Eliminar',
    'detail.deleteConfirm': '¿Está seguro?',
    'detail.deleteDesc': 'Esta acción no se puede deshacer. El anuncio será eliminado permanentemente.',
    'detail.cancel': 'Cancelar',
    'detail.confirmDelete': 'Sí, eliminar',
    'detail.deleteError': 'Error al eliminar',
    'detail.deleteErrorDesc': 'No se pudo eliminar el anuncio.',
    'detail.deleteSuccess': 'Anuncio eliminado',
    'detail.deleteSuccessDesc': 'Su anuncio fue eliminado con éxito.',
    'detail.price': 'Precio',
    'detail.area': 'Área',
    
    // Auth
    'auth.required': 'Autenticación necesaria',
    'auth.requiredDesc': 'Debe iniciar sesión para publicar anuncios.',
    'auth.logout': 'Cerrar sesión',
    
    // Share
    'share.title': 'Compartir',
    'share.copied': '¡Enlace copiado!',
    'share.copiedDesc': 'El enlace fue copiado al portapapeles.',
    'share.copyLink': 'Copiar enlace',
    'share.error': 'Error al copiar',
    
    // Favorites
    'favorites.title': 'Sus Favoritos',
    'favorites.empty': 'Aún no tiene favoritos',
    'favorites.emptyDesc': 'Explore los anuncios y agregue sus favoritos haciendo clic en el ícono de corazón.',
    'favorites.added': '¡Agregado a favoritos!',
    'favorites.removed': 'Eliminado de favoritos',
    'favorites.loginRequired': 'Inicie sesión para guardar favoritos',
    'favorites.browse': 'Explorar anuncios',
    
    // Common
    'common.backToHome': 'Volver al inicio',
    'common.noListingsInCategory': 'No se encontraron anuncios en esta categoría.',
    
    // Login Dialog
    'login.title': 'Ingresar',
    'login.signupTitle': 'Crear Cuenta',
    'login.description': 'Accede a tu cuenta',
    'login.signupDescription': 'Crea tu cuenta',
    'login.name': 'Nombre completo',
    'login.namePlaceholder': 'Juan Pérez',
    'login.email': 'Email',
    'login.emailPlaceholder': 'ejemplo@email.com',
    'login.password': 'Contraseña',
    'login.confirmPassword': 'Confirmar contraseña',
    'login.submit': 'Ingresar',
    'login.signupSubmit': 'Crear cuenta',
    'login.switchToSignup': '¿No tienes cuenta? Crear cuenta',
    'login.switchToLogin': '¿Ya tienes cuenta? Ingresar',
    'login.invalidEmail': 'Email inválido',
    'login.passwordMin': 'La contraseña debe tener al menos 6 caracteres',
    'login.nameTooShort': 'Nombre muy corto',
    'login.passwordMismatch': 'Las contraseñas no coinciden',
    
    // ListingDetail
    'detail.description': 'Descripción',
    'detail.noDescription': 'Sin descripción disponible',
    'detail.bedrooms': 'Dormitorios',
    'detail.bathrooms': 'Baños',
    'detail.rentPerMonth': 'Alquiler/mes',
    
    // Category Page
    'category.vehicles': 'Vehículos',
    'category.realEstateSale': 'Inmuebles en Venta',
    'category.realEstateRent': 'Inmuebles en Alquiler',
    'category.services': 'Servicios',
    'category.default': 'Categoría',
    
    // Location errors
    'location.permissionDenied': 'Permiso de ubicación denegado. Verifique la configuración del navegador.',
    'location.unavailable': 'Ubicación no disponible. Verifique su conexión o GPS.',
    'location.timeout': 'Tiempo agotado. Intente nuevamente.',
    
    // Rating System
    'rating.title': 'Evaluación',
    'rating.vote': 'voto',
    'rating.votes': 'votos',
    'rating.rateThis': 'Evalúe este anuncio:',
    'rating.yourRating': 'Su evaluación:',
    'rating.loginRequired': 'Inicie sesión para evaluar',
    'rating.cannotRateOwn': 'No puede evaluar su propio anuncio',
    'rating.submitted': '¡Evaluación enviada!',
    'rating.updated': '¡Evaluación actualizada!',
    'rating.error': 'Error al enviar evaluación',
    'rating.ownerMessage': 'No puede evaluar su propio anuncio',
    'rating.loginToRate': 'Inicie sesión para evaluar este anuncio',
    
    // Filter
    'filter.title': 'Filtros',
    'filter.description': 'Configure los filtros para refinar su búsqueda',
    'filter.sortBy': 'Ordenar por',
    'filter.selectSort': 'Seleccione una opción',
    'filter.recent': 'Más reciente',
    'filter.oldest': 'Más antiguo',
    'filter.priceAsc': 'Precio ascendente',
    'filter.priceDesc': 'Precio descendente',
    'filter.relevant': 'Búsqueda relevante',
    'filter.priceRange': 'Rango de precio (Gs)',
    'filter.minPrice': 'Precio mínimo',
    'filter.maxPrice': 'Precio máximo',
    'filter.yearRange': 'Rango de año',
    'filter.minYear': 'Año mínimo',
    'filter.maxYear': 'Año máximo',
    'filter.fuelType': 'Tipo de combustible',
    'filter.selectFuel': 'Seleccione el combustible',
    'filter.allFuels': 'Todos',
    'filter.gasoline': 'Gasolina',
    'filter.diesel': 'Diésel',
    'filter.electric': 'Eléctrico',
    'filter.apply': 'Aplicar filtros',
    'filter.clear': 'Limpiar filtros',
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
