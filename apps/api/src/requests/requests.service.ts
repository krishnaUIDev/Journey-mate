import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class RequestsService {
    private readonly logger = new Logger(RequestsService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    async findAcceptedByJourney(journeyId: string) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { data, error } = await client
            .from('journey_requests')
            .select('requester_id, requester_name, requester_avatar')
            .eq('journey_id', journeyId)
            .eq('status', 'accepted');

        if (error) {
            this.logger.error(`Error fetching accepted participants: ${error.message}`);
            throw error;
        }

        return data || [];
    }

    async findByJourney(journeyId: string) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { data, error } = await client
            .from('journey_requests')
            .select('*')
            .eq('journey_id', journeyId);

        if (error) {
            this.logger.error(`Error fetching requests: ${error.message}`);
            throw error;
        }

        return data || [];
    }

    async findMutual(userId1: string, userId2: string) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { data: journeys1 } = await client
            .from('journey_requests')
            .select('journey_id')
            .eq('requester_id', userId1)
            .eq('status', 'accepted');

        const { data: journeys2 } = await client
            .from('journey_requests')
            .select('journey_id')
            .eq('requester_id', userId2)
            .eq('status', 'accepted');

        if (!journeys1 || !journeys2) return [];

        const ids1 = new Set(journeys1.map((j: any) => j.journey_id));
        const commonIds = (journeys2 as any[]).map(j => j.journey_id).filter(id => ids1.has(id));

        if (commonIds.length === 0) return [];

        const { data: connections, error } = await client
            .from('journey_requests')
            .select('requester_name')
            .in('journey_id', commonIds)
            .neq('requester_id', userId1)
            .neq('requester_id', userId2)
            .eq('status', 'accepted')
            .limit(3);

        if (error) {
            this.logger.error(`Error fetching mutual connections: ${error.message}`);
            return [];
        }

        return connections ? connections.map((c: any) => c.requester_name) : [];
    }
}
