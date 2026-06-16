import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const MAX_ORIGINAL_SIZE = 50 * 1024 * 1024;
  const MAX_UPLOAD_SIZE = 4.5 * 1024 * 1024;

  const getUserId = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const createBlob = (quality: number) => {
            canvas.toBlob((blob) => {
              if (!blob) return;
              if (blob.size <= MAX_UPLOAD_SIZE || quality <= 0.45) {
                resolve(blob);
                return;
              }
              createBlob(quality - 0.1);
            }, 'image/jpeg', quality);
          };

          createBlob(0.82);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const userId = await getUserId();
      if (!userId) {
        throw new Error('Você precisa estar logado para fazer upload de imagens.');
      }

      // Validate original file size; upload is compressed below 5MB afterward.
      if (file.size > MAX_ORIGINAL_SIZE) {
        toast({
          title: "Arquivo muito grande",
          description: `O arquivo excede o limite de 50MB`,
          variant: "destructive",
        });
        return null;
      }

      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Apenas JPG, PNG e WEBP são permitidos",
          variant: "destructive",
        });
        return null;
      }

      setUploading(true);
      const compressedBlob = await compressImage(file);
      if (compressedBlob.size > MAX_UPLOAD_SIZE) {
        toast({
          title: "Imagem muito grande",
          description: "A imagem não pôde ser reduzida abaixo de 5MB.",
          variant: "destructive",
        });
        return null;
      }
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const filePath = `${userId}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('listing-images')
        .upload(filePath, compressedBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        
        let userMessage = "Falha ao enviar imagem. Tente novamente.";
        if (error.message?.includes('size') || error.message?.includes('large')) {
          userMessage = "Imagem muito grande. Use arquivos menores.";
        } else if (error.message?.includes('Duplicate')) {
          userMessage = "Este arquivo já foi enviado.";
        }
        
        toast({
          title: 'Erro ao enviar imagem',
          description: userMessage,
          variant: 'destructive',
        });
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('listing-images')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error: unknown) {
      console.error('Image upload error:', error);
      
      let userMessage = "Falha ao processar imagem. Tente novamente.";
      const message = error instanceof Error ? error.message : '';
      if (message.includes('logged') || message.includes('auth')) {
        userMessage = "Você precisa estar logado para enviar imagens.";
      }
      
      toast({
        title: 'Erro ao enviar imagem',
        description: userMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(file => uploadImage(file));
    const results = await Promise.all(uploadPromises);
    return results.filter((url): url is string => url !== null);
  };

  return { uploadImage, uploadMultipleImages, uploading };
};
