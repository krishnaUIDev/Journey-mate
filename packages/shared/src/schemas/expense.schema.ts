import { z } from 'zod';

export const ExpenseSchema = z.object({
    id: z.string().uuid().optional(),
    journey_id: z.string(),
    payer_id: z.string(),
    payer_name: z.string(),
    amount: z.number(),
    description: z.string(),
    currency: z.string().default('USD'),
    is_settlement: z.boolean().default(false),
    receiver_id: z.string().optional().nullable(),
    created_at: z.string().optional(),
});

export type Expense = z.infer<typeof ExpenseSchema>;
