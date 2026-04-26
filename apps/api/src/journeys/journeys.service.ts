import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class JourneysService {
    private readonly logger = new Logger(JourneysService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    async findAll() {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('journeys')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            this.logger.error(`Error fetching journeys: ${error.message}`);
            throw error;
        }

        return data;
    }

    async create(journeyData: any) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('journeys')
            .insert([journeyData])
            .select();

        if (error) {
            this.logger.error(`Error creating journey: ${error.message}`);
            throw error;
        }

        return data[0];
    }

    async findById(id: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('journeys')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            this.logger.error(`Error fetching journey ${id}: ${error.message}`);
            throw error;
        }

        return data;
    }

    async update(id: string, updates: any) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('journeys')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) {
            this.logger.error(`Error updating journey ${id}: ${error.message}`);
            throw error;
        }

        return data[0];
    }

    async delete(id: string) {
        const { error } = await this.supabaseService
            .getClient()
            .from('journeys')
            .delete()
            .eq('id', id);

        if (error) {
            this.logger.error(`Error deleting journey ${id}: ${error.message}`);
            throw error;
        }

        return { deleted: true };
    }
}
