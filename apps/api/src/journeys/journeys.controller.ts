import { Controller, Get, Post, Body, Param, Logger, UseGuards, Patch, Delete } from '@nestjs/common';
import { JourneysService } from './journeys.service';
import { ClerkGuard } from '../auth/clerk.guard';
import * as Shared from '@journey-mate/shared';

@Controller('journeys')
export class JourneysController {
    private readonly logger = new Logger(JourneysController.name);

    constructor(private readonly journeysService: JourneysService) { }

    @Get()
    async findAll() {
        return this.journeysService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.journeysService.findById(id);
    }

    @Post()
    @UseGuards(ClerkGuard)
    async create(@Body() createJourneyDto: Shared.Journey) {
        this.logger.log(`Received request to create journey from ${createJourneyDto.origin} to ${createJourneyDto.destination}`);
        return this.journeysService.create(createJourneyDto);
    }

    @Patch(':id')
    @UseGuards(ClerkGuard)
    async update(@Param('id') id: string, @Body() updates: Partial<Shared.Journey>) {
        this.logger.log(`Received request to update journey ${id}`);
        return this.journeysService.update(id, updates);
    }

    @Delete(':id')
    @UseGuards(ClerkGuard)
    async remove(@Param('id') id: string) {
        this.logger.log(`Received request to delete journey ${id}`);
        return this.journeysService.delete(id);
    }
}
