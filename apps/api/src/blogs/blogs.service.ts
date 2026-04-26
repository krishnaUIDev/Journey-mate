import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class BlogsService {
    private readonly logger = new Logger(BlogsService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    async findAll() {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            this.logger.error(`Error fetching blog posts: ${error.message}`);
            throw error;
        }

        return data;
    }

    async findBySlug(slug: string) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) {
            this.logger.error(`Error fetching blog post by slug ${slug}: ${error.message}`);
            throw error;
        }

        return data;
    }

    async create(postData: any) {
        // Generate slug from title if not provided
        if (!postData.slug) {
            postData.slug = postData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
        }

        const { data, error } = await this.supabaseService
            .getClient()
            .from('blog_posts')
            .insert([postData])
            .select();

        if (error) {
            this.logger.error(`Error creating blog post: ${error.message}`);
            throw error;
        }

        return data[0];
    }
}
