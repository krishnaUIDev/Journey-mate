import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { JourneysModule } from './journeys/journeys.module';
import { BlogsModule } from './blogs/blogs.module';
import { GuestbookModule } from './guestbook/guestbook.module';
import { KudosModule } from './kudos/kudos.module';
import { ItineraryModule } from './itinerary/itinerary.module';
import { SouvenirsModule } from './souvenirs/souvenirs.module';
import { ProfilesModule } from './profiles/profiles.module';
import { JobsModule } from './jobs/jobs.module';
import { RequestsModule } from './requests/requests.module';
import { MessagesModule } from './messages/messages.module';
import { ExpensesModule } from './expenses/expenses.module';
import { SecurityModule } from './security/security.module';
import { LocationsModule } from './locations/locations.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    JourneysModule,
    BlogsModule,
    GuestbookModule,
    KudosModule,
    ItineraryModule,
    SouvenirsModule,
    ProfilesModule,
    JobsModule,
    RequestsModule,
    MessagesModule,
    ExpensesModule,
    SecurityModule,
    LocationsModule,
    ReviewsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
