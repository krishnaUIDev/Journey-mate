import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SecurityService } from './security.service';
import * as Shared from '@journey-mate/shared';
import { ClerkGuard } from '../auth/clerk.guard';

@Controller('security')
export class SecurityController {
    constructor(private readonly securityService: SecurityService) { }

    @Get('journey/:journeyId')
    async findByJourney(@Param('journeyId') journeyId: string) {
        return this.securityService.findByJourney(journeyId);
    }

    @Post('vault')
    @UseGuards(ClerkGuard)
    async upsert(@Body() contact: Shared.EmergencyContact) {
        return this.securityService.upsert(contact);
    }

    @Delete('vault/:journeyId/user/:userId')
    @UseGuards(ClerkGuard)
    async remove(@Param('journeyId') journeyId: string, @Param('userId') userId: string) {
        return this.securityService.remove(journeyId, userId);
    }
}
