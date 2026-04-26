import { Module } from '@nestjs/common';
import { ItineraryController } from './itinerary.controller';
import { ItineraryService } from './itinerary.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    controllers: [ItineraryController],
    providers: [ItineraryService],
    exports: [ItineraryService],
})
export class ItineraryModule { }
