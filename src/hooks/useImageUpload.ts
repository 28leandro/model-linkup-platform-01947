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
    return new Promise(async (resolve, reject) => {
      try {
        // Try modern createImageBitmap first (better mobile support, handles EXIF)
        let bitmap: ImageBitmap | HTMLImageElement | null = null;
        let width = 0;
        let height = 0;

        if (typeof createImageBitmap === 'function') {
          try {
            bitmap = await createImageBitmap(file);
            width = bitmap.width;
            height = bitmap.height;
          } catch {
            bitmap = null;
          }
        }

        if (!bitmap) {
          // Fallback for older browsers / unsupported formats
          const dataUrl: string = await new Promise((res, rej) => {
            const reader = new FileReader();
            reader.onload = (e) => res(e.target?.result as string);
            reader.onerror = () => rej(new Error('FileReader failed'));
            reader.readAsDataURL(file);
          });
          const img = await new Promise<HTMLImageElement>((res, rej) => {
            const i = new Image();
            i.onload = () => res(i);
            i.onerror = () => rej(new Error('Imagem inválida ou formato não suportado (tente JPG ou PNG).'));
            i.src = dataUrl;
          });
          bitmap = img;
          width = img.naturalWidth || img.width;
          height = img.naturalHeight || img.height;
        }

        if (!width || !height) {
          reject(new Error('Não foi possível ler as dimensões da imagem.'));
          return;
        }

        const MAX_DIM = 1200;
        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else if (height >= width && height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas indisponível no navegador.'));
          return;
        }
        ctx.drawImage(bitmap as CanvasImageSource, 0, 0, width, height);
        if ('close' in bitmap && typeof (bitmap as ImageBitmap).close === 'function') {
          (bitmap as ImageBitmap).close();
        }

        const tryQuality = (quality: number) => {
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Falha ao gerar imagem comprimida.'));
              return;
            }
            if (blob.size <= MAX_UPLOAD_SIZE || quality <= 0.4) {
              resolve(blob);
              return;
            }
            tryQuality(Math.max(0.4, quality - 0.1));
          }, 'image/jpeg', quality);
        };
        tryQuality(0.82);
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Falha ao processar imagem.'));
      }
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
      let compressedBlob: Blob;
      try {
        compressedBlob = await compressImage(file);
      } catch (compressErr) {
        const msg = compressErr instanceof Error ? compressErr.message : 'Falha ao processar imagem.';
        toast({
          title: 'Erro ao processar imagem',
          description: msg + ' Tente outra foto em JPG ou PNG.',
          variant: 'destructive',
        });
        return null;
      }
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
