import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { LocationsService } from './locations.service';
import * as Shared from '@journey-mate/shared';
import { ClerkGuard } from '../auth/clerk.guard';

@Controller('locations')
export class LocationsController {
    constructor(private readonly locationsService: LocationsService) { }

    @Get('journey/:journeyId')
    async findByJourney(@Param('journeyId') journeyId: string) {
        return this.locationsService.findByJourney(journeyId);
    }

    @Post()
    @UseGuards(ClerkGuard)
    async upsert(@Body() location: Shared.SquadLocation) {
        return this.locationsService.upsert(location);
    }
}
