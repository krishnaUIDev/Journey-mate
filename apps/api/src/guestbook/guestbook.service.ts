import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class GuestbookService {
    private readonly logger = new Logger(GuestbookService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    async findByJourney(journeyId: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('journey_guestbook')
            .select('*')
            .eq('journey_id', journeyId)
            .order('created_at', { ascending: false });

        if (error) {
            this.logger.error(`Error fetching guestbook for journey ${journeyId}: ${error.message}`);
            throw error;
        }

        return data;
    }

    async create(entry: any) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('journey_guestbook')
            .insert([entry])
            .select();

        if (error) {
            this.logger.error(`Error creating guestbook entry: ${error.message}`);
            throw error;
        }

        return data[0];
    }
}
