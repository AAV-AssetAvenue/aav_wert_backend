import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { NewsSchema,News } from 'src/mongoose/schemas/news.schema';

@Module({
   imports: [
      MongooseModule.forFeature([{ name: News.name, schema: NewsSchema }]),
      AuthModule,
    ],
  controllers: [NewsController],
  providers: [NewsService],
  
})
export class NewsModule {}
