import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class JobsService {
    private readonly logger = new Logger(JobsService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    async findActive() {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { data, error } = await client
            .from('jobs')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false });

        if (error) {
            this.logger.error(`Error fetching jobs: ${error.message}`);
            throw error;
        }

        return data || [];
    }
}
