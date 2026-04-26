import { Controller, Get, Query } from '@nestjs/common';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
export class ProfilesController {
    constructor(private readonly profilesService: ProfilesService) { }

    @Get()
    async findAll(@Query('limit') limit?: number) {
        return this.profilesService.findAll(limit ? Number(limit) : 12);
    }

    @Get('public')
    async findPublic(@Query('limit') limit?: number) {
        return this.profilesService.findPublicProfiles(limit ? Number(limit) : 20);
    }
}
