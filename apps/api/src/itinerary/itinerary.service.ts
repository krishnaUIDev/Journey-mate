import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ItineraryItem } from '@journey-mate/shared';

@Injectable()
export class ItineraryService {
    private readonly logger = new Logger(ItineraryService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    async create(item: ItineraryItem) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { data, error } = await client
            .from('journey_itinerary')
            .insert([item])
            .select()
            .single();

        if (error) {
            this.logger.error(`Error creating itinerary item: ${error.message}`);
            throw error;
        }

        return data;
    }

    async findByJourney(journeyId: string) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { data, error } = await client
            .from('journey_itinerary')
            .select('*')
            .eq('journey_id', journeyId)
            .order('start_time', { ascending: true });

        if (error) {
            this.logger.error(`Error fetching itinerary: ${error.message}`);
            throw error;
        }

        return data || [];
    }

    async remove(id: string) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { error } = await client
            .from('journey_itinerary')
            .delete()
            .eq('id', id);

        if (error) {
            this.logger.error(`Error deleting itinerary item: ${error.message}`);
            throw error;
        }

        return { success: true };
    }
}
