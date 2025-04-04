import { Module } from "@nestjs/common";
import { OrderService } from "./order.service";
import { OrderController } from "./order.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Order, OrderSchema } from "src/mongoose/schemas/order.schema";
import { AuthModule } from "src/auth/auth.module";
import { HttpModule } from "@nestjs/axios";
import { CryptoOrder,CryptoOrderSchema} from "src/mongoose/schemas/cryptoOrder.schema";
import { Commission, CommissionSchema } from "src/mongoose/schemas/commission.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      {name: CryptoOrder.name, schema: CryptoOrderSchema },
      { name: Commission.name, schema: CommissionSchema },
    ]),      
    AuthModule,
    HttpModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
