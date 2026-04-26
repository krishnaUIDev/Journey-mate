import { Controller, Get, Post, Body, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { KudosService } from './kudos.service';
import * as Shared from '@journey-mate/shared';
import { ClerkGuard } from '../auth/clerk.guard';

@Controller('kudos')
export class KudosController {
    constructor(private readonly kudosService: KudosService) { }

    @Post()
    @UseGuards(ClerkGuard)
    async create(@Body() kudo: Shared.Kudos) {
        try {
            return await this.kudosService.create(kudo);
        } catch (error: any) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get('user/:userId')
    async findByReviewee(@Param('userId') userId: string) {
        return await this.kudosService.findByReviewee(userId);
    }
}
