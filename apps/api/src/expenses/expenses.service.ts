import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Expense } from '@journey-mate/shared';

@Injectable()
export class ExpensesService {
    private readonly logger = new Logger(ExpensesService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    async findByJourney(journeyId: string) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { data, error } = await client
            .from('journey_expenses')
            .select('*')
            .eq('journey_id', journeyId)
            .order('created_at', { ascending: false });

        if (error) {
            this.logger.error(`Error fetching expenses: ${error.message}`);
            throw error;
        }

        return data || [];
    }

    async create(expense: Expense) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { data, error } = await client
            .from('journey_expenses')
            .insert([expense])
            .select()
            .single();

        if (error) {
            this.logger.error(`Error creating expense: ${error.message}`);
            throw error;
        }

        return data;
    }

    async update(id: string, payerId: string, updates: Partial<Expense>) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { data, error } = await client
            .from('journey_expenses')
            .update(updates)
            .eq('id', id)
            .eq('payer_id', payerId)
            .select()
            .single();

        if (error) {
            this.logger.error(`Error updating expense: ${error.message}`);
            throw error;
        }

        return data;
    }

    async remove(id: string, payerId: string) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { error } = await client
            .from('journey_expenses')
            .delete()
            .eq('id', id)
            .eq('payer_id', payerId);

        if (error) {
            this.logger.error(`Error deleting expense: ${error.message}`);
            throw error;
        }

        return { success: true };
    }
}
