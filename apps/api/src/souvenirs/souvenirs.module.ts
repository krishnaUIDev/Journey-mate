import { Module } from '@nestjs/common';
import { SouvenirsController } from './souvenirs.controller';
import { SouvenirsService } from './souvenirs.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
    imports: [SupabaseModule],
    controllers: [SouvenirsController],
    providers: [SouvenirsService],
    exports: [SouvenirsService],
})
export class SouvenirsModule { }
