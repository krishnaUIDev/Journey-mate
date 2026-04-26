import { Controller, Get, Post, Delete, Body, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { SouvenirsService } from './souvenirs.service';
import * as Shared from '@journey-mate/shared';
import { ClerkGuard } from '../auth/clerk.guard';

@Controller('souvenirs')
export class SouvenirsController {
    constructor(private readonly souvenirsService: SouvenirsService) { }

    @Post()
    @UseGuards(ClerkGuard)
    async create(@Body() souvenir: Shared.Souvenir) {
        try {
            return await this.souvenirsService.create(souvenir);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get('journey/:journeyId')
    async findByJourney(@Param('journeyId') journeyId: string) {
        return await this.souvenirsService.findByJourney(journeyId);
    }

    @Delete(':id')
    @UseGuards(ClerkGuard)
    async remove(@Param('id') id: string) {
        return await this.souvenirsService.remove(id);
    }
}
