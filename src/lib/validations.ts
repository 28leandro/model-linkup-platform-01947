import { z } from "zod";

export const listingSchema = z.object({
  title: z.string()
    .trim()
    .min(5, "O título deve ter pelo menos 5 caracteres")
    .max(200, "O título deve ter no máximo 200 caracteres"),
  description: z.string()
    .trim()
    .max(5000, "A descrição deve ter no máximo 5000 caracteres")
    .optional()
    .or(z.literal("")),
  phone: z.string()
    .trim()
    .max(30, "Telefone muito longo")
    .refine((val) => val === "" || val.replace(/\D/g, "").length >= 6, "Telefone muito curto")
    .optional()
    .or(z.literal("")),
  category: z.string()
    .min(1, "Selecione uma categoria válida")
    .refine((val) => ["vehicles", "real-estate", "services", "home-garden", "tech", "fashion", "sport"].includes(val), {
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
