import { Controller, Get, Param } from '@nestjs/common';
import { RequestsService } from './requests.service';

@Controller('requests')
export class RequestsController {
    constructor(private readonly requestsService: RequestsService) { }

    @Get('journey/:journeyId/accepted')
    async findAccepted(@Param('journeyId') journeyId: string) {
        return this.requestsService.findAcceptedByJourney(journeyId);
    }

    @Get('journey/:journeyId')
    async findByJourney(@Param('journeyId') journeyId: string) {
        return this.requestsService.findByJourney(journeyId);
    }

    @Get('mutual/:userId1/:userId2')
    async findMutual(@Param('userId1') userId1: string, @Param('userId2') userId2: string) {
        return this.requestsService.findMutual(userId1, userId2);
    }
}
