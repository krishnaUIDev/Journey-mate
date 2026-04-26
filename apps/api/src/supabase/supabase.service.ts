import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private readonly logger = new Logger(SupabaseService.name);
    private client: SupabaseClient;

    constructor(private configService: ConfigService) {
        const rawUrl = this.configService.get<string>('SUPABASE_URL');
        const rawKey = this.configService.get<string>('SUPABASE_KEY');

        if (!rawUrl || !rawKey) {
            this.logger.error('Supabase URL or Key is missing in environment variables');
            return;
        }

        // Advanced structural diagnostic
        const url = rawUrl.trim();
        const key = rawKey.trim();

        const maskedUrl = url.substring(0, 15) + '...';
        const maskedKey = key.substring(0, 10) + '...' + key.substring(key.length - 5);

        this.logger.log(`Supabase Config: URL_LEN=${url.length}, KEY_LEN=${key.length}`);
        this.logger.log(`Supabase Masked: URL=${maskedUrl}, KEY=${maskedKey}`);

        if (url !== rawUrl || key !== rawKey) {
            this.logger.warn('DETECTED HIDDEN WHITESPACE in Supabase environment variables! Automated trimming applied.');
        }

        this.client = createClient(url, key);
        this.logger.log('Supabase client initialized successfully');
    }

    getClient(): SupabaseClient {
        return this.client;
    }
}
