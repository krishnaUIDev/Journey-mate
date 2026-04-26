import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SquadLocation } from '@journey-mate/shared';

@Injectable()
export class LocationsService {
    private readonly logger = new Logger(LocationsService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    async findByJourney(journeyId: string) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { data, error } = await client
            .from('journey_locations')
            .select('*')
            .eq('journey_id', journeyId);

        if (error) {
            this.logger.error(`Error fetching locations: ${error.message}`);
            throw error;
        }

        return data || [];
    }

    async upsert(location: SquadLocation) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { data, error } = await client
            .from('journey_locations')
            .upsert([location], { onConflict: 'journey_id,user_id' })
            .select()
            .single();

        if (error) {
            this.logger.error(`Error upserting location: ${error.message}`);
            throw error;
        }

        return data;
    }
}
