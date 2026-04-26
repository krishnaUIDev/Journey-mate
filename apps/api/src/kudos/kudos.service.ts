import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Kudos } from '@journey-mate/shared';

@Injectable()
export class KudosService {
    private readonly logger = new Logger(KudosService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    async create(kudo: Kudos) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        // Check for existing kudo to prevent duplicates
        const { data: existing } = await client
            .from('user_reviews')
            .select('id')
            .eq('reviewer_id', kudo.reviewer_id)
            .eq('reviewee_id', kudo.reviewee_id)
            .limit(1);

        if (existing && existing.length > 0) {
            throw new Error('You have already given kudos to this user.');
        }

        const { data, error } = await client
            .from('user_reviews')
            .insert([kudo])
            .select()
            .single();

        if (error) {
            this.logger.error(`Error creating kudo: ${error.message}`);
            throw error;
        }

        return data;
    }

    async findByReviewee(userId: string) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { data, error } = await client
            .from('user_reviews')
            .select('*')
            .eq('reviewee_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            this.logger.error(`Error fetching kudos: ${error.message}`);
            throw error;
        }

        return data || [];
    }
}
