import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ProfilesService {
    private readonly logger = new Logger(ProfilesService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    async findAll(limit: number = 12) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        // 1. Fetch from user_profiles
        const { data: profiles, error } = await client
            .from('user_profiles')
            .select('*')
            .order('avg_rating', { ascending: false })
            .limit(limit);

        if (error) {
            this.logger.error(`Error fetching profiles: ${error.message}`);
            throw error;
        }

        return profiles || [];
    }

    async findPublicProfiles(limit: number = 20) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        // Fallback: Fetch unique users from journeys if needed (implemented in service logic if controller requests it)
        const { data, error } = await client
            .from('journeys')
            .select('user_id, user_name, user_avatar, user_rating, user_verified, user_verification_tier')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            this.logger.error(`Error fetching public profiles from journeys: ${error.message}`);
            throw error;
        }

        return data || [];
    }
}
