import { z } from 'zod';

export const availabilityQuery = z.object({
  slug: z.string().min(1).max(80),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const checkoutBody = z.object({
  slug: z.string().min(1).max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  items: z
    .array(z.object({ optionId: z.string().uuid(), quantity: z.number().int().min(1).max(20) }))
    .min(1)
    .max(10),
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(160),
    phone: z.string().trim().min(7).max(30),
    lodging: z.string().trim().max(160).optional().default(''),
    comments: z.string().trim().max(1000).optional().default(''),
  }),
  locale: z.enum(['es', 'en']).default('es'),
  attribution: z
    .object({
      utm: z.record(z.string().max(200)).optional(),
      fbp: z.string().max(100).optional(),
      fbc: z.string().max(200).optional(),
      pageUrl: z.string().max(500).optional(),
      eventId: z.string().max(100).optional(),
    })
    .optional(),
});
export type CheckoutBody = z.infer<typeof checkoutBody>;
