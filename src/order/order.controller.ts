import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  UseGuards,
  Req,
} from "@nestjs/common";
import { OrderService } from "./order.service";
import { ZodValidationPipe } from "src/zode.validation.pipe";
import { CreateOrderDto, CreateOrderSchema, CryptoOrderDTO,CryptoOrderSchema} from "./dto";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/decorators/roles.decorator";
import { UserRoles } from "src/mongoose/schemas/user.schema";
import { Request } from "express";

@Controller("order")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post("create")
  @UsePipes(new ZodValidationPipe(CreateOrderSchema))
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.USER)
  create(@Req() req: Request, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(req.user, createOrderDto);
  }

  @Post("cryptoOrder")
  @UsePipes(new ZodValidationPipe(CryptoOrderSchema))
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.USER)
  createCryptoOrder(@Req() req: Request, @Body() cryptoOrderDto: CryptoOrderDTO) {
    return this.orderService.cryptoOrder(req.user, cryptoOrderDto);
  }

  

  @Get("findByOrderId/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.USER)
  findByOrderId(@Req() req: Request, @Param("id") id: string) {
    return this.orderService.findByOrderId(req.user, id);
  }

  @Get("/totalAavTransfered")
  totalAavTransferedAmount() {
    return this.orderService.totalAavTransfered();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.orderService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateOrderDto: any) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Post("wert/webhook")
  wertWebhook(@Body() body: any) {
    return this.orderService.wertWebhook(body);
  }

  @Get("wert/session")
  wertSession() {
    return this.orderService.wertSession();
  }

  @Post("commissions/claim")
  @UseGuards(JwtAuthGuard)
  @Roles(UserRoles.USER)
  async claimSolUsdcCommission(@Req() req: Request,@Body() body: any) {
    
    return await this.orderService.claimSolUsdcCommission(req.user);
  }
  @Post("commissions/claim/aav")
  @UseGuards(JwtAuthGuard)
  @Roles(UserRoles.USER)
  async claimAAVCommission(@Req() req: Request,@Body() body: any) {
    
    return await this.orderService.claimAAVCommission(req.user);
  }
}
