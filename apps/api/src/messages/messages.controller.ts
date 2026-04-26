import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import * as Shared from '@journey-mate/shared';
import { ClerkGuard } from '../auth/clerk.guard';

@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Get('journey/:journeyId')
    async findByJourney(@Param('journeyId') journeyId: string) {
        return this.messagesService.findByJourney(journeyId);
    }

    @Post()
    @UseGuards(ClerkGuard)
    async create(@Body() message: Shared.Message) {
        return this.messagesService.create(message);
    }

    @Patch(':id')
    @UseGuards(ClerkGuard)
    async update(@Param('id') id: string, @Body('content') content: string) {
        return this.messagesService.update(id, content);
    }

    @Delete(':id')
    @UseGuards(ClerkGuard)
    async remove(@Param('id') id: string) {
        return this.messagesService.remove(id);
    }
}
