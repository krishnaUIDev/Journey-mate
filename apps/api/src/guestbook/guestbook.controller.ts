import { Controller, Get, Post, Body, Param, Logger, UseGuards } from '@nestjs/common';
import { GuestbookService } from './guestbook.service';
import { ClerkGuard } from '../auth/clerk.guard';
import * as Shared from '@journey-mate/shared';

@Controller('guestbook')
export class GuestbookController {
    private readonly logger = new Logger(GuestbookController.name);

    constructor(private readonly guestbookService: GuestbookService) { }

    @Get('journey/:id')
    async findByJourney(@Param('id') id: string) {
        return this.guestbookService.findByJourney(id);
    }

    @Post()
    @UseGuards(ClerkGuard)
    async create(@Body() entry: Shared.GuestbookEntry) {
        this.logger.log(`Received new guestbook entry for journey: ${entry.journey_id}`);
        return this.guestbookService.create(entry);
    }
}
