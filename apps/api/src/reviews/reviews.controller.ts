import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import * as Shared from '@journey-mate/shared';
import { ClerkGuard } from '../auth/clerk.guard';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Get('journey/:journeyId')
    async findByJourney(@Param('journeyId') journeyId: string) {
        return this.reviewsService.findByJourney(journeyId);
    }

    @Post()
    @UseGuards(ClerkGuard)
    async create(@Body() review: Shared.JourneyReview) {
        return this.reviewsService.create(review);
    }
}
