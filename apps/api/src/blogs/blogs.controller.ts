import { Controller, Get, Post, Body, Param, Logger, UseGuards } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { ClerkGuard } from '../auth/clerk.guard';
import * as Shared from '@journey-mate/shared';

@Controller('blogs')
export class BlogsController {
    private readonly logger = new Logger(BlogsController.name);

    constructor(private readonly blogsService: BlogsService) { }

    @Get()
    async findAll() {
        return this.blogsService.findAll();
    }

    @Get(':slug')
    async findOne(@Param('slug') slug: string) {
        return this.blogsService.findBySlug(slug);
    }

    @Post()
    @UseGuards(ClerkGuard)
    async create(@Body() createBlogDto: Shared.BlogPost) {
        this.logger.log(`Received request to create blog post: ${createBlogDto.title}`);
        return this.blogsService.create(createBlogDto);
    }
}
