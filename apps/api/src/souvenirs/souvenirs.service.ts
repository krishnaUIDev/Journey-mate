import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Souvenir } from '@journey-mate/shared';

@Injectable()
export class SouvenirsService {
    private readonly logger = new Logger(SouvenirsService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    async create(souvenir: Souvenir) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { data, error } = await client
            .from('journey_souvenirs')
            .insert([souvenir])
            .select()
            .single();

        if (error) {
            this.logger.error(`Error creating souvenir: ${error.message}`);
            throw error;
        }

        return data;
    }

    async findByJourney(journeyId: string) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { data, error } = await client
            .from('journey_souvenirs')
            .select('*')
            .eq('journey_id', journeyId)
            .order('created_at', { ascending: false });

        if (error) {
            this.logger.error(`Error fetching souvenirs: ${error.message}`);
            throw error;
        }

        return data || [];
    }

    async remove(id: string) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { error } = await client
            .from('journey_souvenirs')
            .delete()
            .eq('id', id);

        if (error) {
            this.logger.error(`Error deleting souvenir: ${error.message}`);
            throw error;
        }

        return { success: true };
    }
}
