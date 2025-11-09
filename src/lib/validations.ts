import { z } from "zod";

export const listingSchema = z.object({
  title: z.string()
    .trim()
    .min(5, "O título deve ter pelo menos 5 caracteres")
    .max(100, "O título deve ter no máximo 100 caracteres"),
  description: z.string()
    .trim()
    .min(20, "A descrição deve ter pelo menos 20 caracteres")
    .max(2000, "A descrição deve ter no máximo 2000 caracteres"),
  phone: z.string()
    .regex(/^[\d\s\-\+\(\)]+$/, "Formato de telefone inválido")
    .min(8, "Telefone muito curto")
    .max(20, "Telefone muito longo")
    .optional()
    .or(z.literal("")),
  rating: z.number()
    .min(1, "A avaliação deve ser no mínimo 1")
    .max(5, "A avaliação deve ser no máximo 5"),
  category: z.string()
    .refine((val) => ["vehicles", "real-estate", "services"].includes(val), {
      message: "Selecione uma categoria válida"
    }),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  location: z.string().min(1, "Selecione uma localização")
});

export type ListingFormData = z.infer<typeof listingSchema>;
