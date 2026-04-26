import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { JourneyReview } from '@journey-mate/shared';

@Injectable()
export class ReviewsService {
    private readonly logger = new Logger(ReviewsService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    async findByJourney(journeyId: string) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { data, error } = await client
            .from('journey_reviews')
            .select('*')
            .eq('journey_id', journeyId);

        if (error) {
            this.logger.error(`Error fetching journey reviews: ${error.message}`);
            throw error;
        }

        return data || [];
    }

    async create(review: JourneyReview) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { data, error } = await client
            .from('journey_reviews')
            .insert([review])
            .select()
            .single();

        if (error) {
            this.logger.error(`Error creating journey review: ${error.message}`);
            throw error;
        }

        return data;
    }
}
