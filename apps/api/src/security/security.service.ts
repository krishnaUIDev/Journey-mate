import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { EmergencyContact } from '@journey-mate/shared';

@Injectable()
export class SecurityService {
    private readonly logger = new Logger(SecurityService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    async findByJourney(journeyId: string) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { data, error } = await client
            .from('journey_emergency_contacts')
            .select('*')
            .eq('journey_id', journeyId);

        if (error) {
            this.logger.error(`Error fetching emergency contacts: ${error.message}`);
            throw error;
        }

        return data || [];
    }

    async upsert(contact: EmergencyContact) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { data, error } = await client
            .from('journey_emergency_contacts')
            .upsert([contact], { onConflict: 'journey_id,user_id' })
            .select()
            .single();

        if (error) {
            this.logger.error(`Error upserting emergency contact: ${error.message}`);
            throw error;
        }

        return data;
    }

    async remove(journeyId: string, userId: string) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { error } = await client
            .from('journey_emergency_contacts')
            .delete()
            .eq('journey_id', journeyId)
            .eq('user_id', userId);

        if (error) {
            this.logger.error(`Error deleting emergency contact: ${error.message}`);
            throw error;
        }

        return { success: true };
    }
}
