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
  category: z.string()
    .min(1, "Selecione uma categoria válida")
    .refine((val) => ["vehicles", "real-estate", "services", "home-garden", "tech"].includes(val), {
      message: "Selecione uma categoria válida"
    }),
  price: z.number()
    .nonnegative("O preço deve ser positivo ou zero")
    .optional()
    .or(z.literal(0)),
  area: z.number()
    .nonnegative("A metragem deve ser positiva ou zero")
    .optional()
    .or(z.literal(0)),
  latitude: z.number().min(-90).max(90).optional().default(0),
  longitude: z.number().min(-180).max(180).optional().default(0),
  location: z.string().min(1, "Digite uma localização")
});

export type ListingFormData = z.infer<typeof listingSchema>;
