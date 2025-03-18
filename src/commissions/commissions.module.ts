import { Module } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { CommissionsController } from './commissions.controller';
import { AuthModule } from "src/auth/auth.module";
import { Commission, CommissionSchema } from 'src/mongoose/schemas/commission.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AAVVested, AAVVestedSchema } from 'src/mongoose/schemas/AAVVested.schema';

@Module({
   imports: [
      MongooseModule.forFeature([
        { name: Commission.name, schema: CommissionSchema },
        { name: AAVVested.name, schema: AAVVestedSchema },
      ]),
      AuthModule,
    ],
  providers: [CommissionsService],
  controllers: [CommissionsController]
})
export class CommissionsModule {}
