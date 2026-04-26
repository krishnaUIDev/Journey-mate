import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Message } from '@journey-mate/shared';

@Injectable()
export class MessagesService {
    private readonly logger = new Logger(MessagesService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    async findByJourney(journeyId: string) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { data, error } = await client
            .from('journey_messages')
            .select('*')
            .eq('journey_id', journeyId)
            .order('created_at', { ascending: true });

        if (error) {
            this.logger.error(`Error fetching messages: ${error.message}`);
            throw error;
        }

        return data || [];
    }

    async create(message: Message) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { data, error } = await client
            .from('journey_messages')
            .insert([message])
            .select()
            .single();

        if (error) {
            this.logger.error(`Error creating message: ${error.message}`);
            throw error;
        }

        return data;
    }

    async update(id: string, content: string) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { data, error } = await client
            .from('journey_messages')
            .update({ content })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            this.logger.error(`Error updating message: ${error.message}`);
            throw error;
        }

        return data;
    }

    async remove(id: string) {
        const client = this.supabaseService.getClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { error } = await client
            .from('journey_messages')
            .delete()
            .eq('id', id);

        if (error) {
            this.logger.error(`Error deleting message: ${error.message}`);
            throw error;
        }

        return { success: true };
    }
}
