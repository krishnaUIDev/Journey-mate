import { Controller, Get, Post, Delete, Body, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ItineraryService } from './itinerary.service';
import * as Shared from '@journey-mate/shared';
import { ClerkGuard } from '../auth/clerk.guard';

@Controller('itinerary')
export class ItineraryController {
    constructor(private readonly itineraryService: ItineraryService) { }

    @Post()
    @UseGuards(ClerkGuard)
    async create(@Body() item: Shared.ItineraryItem) {
        try {
            return await this.itineraryService.create(item);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get('journey/:journeyId')
    async findByJourney(@Param('journeyId') journeyId: string) {
        return await this.itineraryService.findByJourney(journeyId);
    }

    @Delete(':id')
    @UseGuards(ClerkGuard)
    async remove(@Param('id') id: string) {
        return await this.itineraryService.remove(id);
    }
}
