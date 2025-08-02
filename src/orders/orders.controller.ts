import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  ParseEnumPipe,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { ParamIdDto } from "./dto/param-id.dto";
import { CreateOrderDto } from "./dto/create-order.dto";
import { CreateOrderWithItemsDto } from "./dto/create-order-with-items.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { OrderStatus, PaymentStatus } from "./order.entity";

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Post("with-items")
  createOrderWithItems(@Body() orderData: CreateOrderWithItemsDto) {
    return this.ordersService.createOrderWithItems(orderData);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(":id")
  findOne(@Param() paramIdDto: ParamIdDto) {
    return this.ordersService.findOne(paramIdDto.id);
  }

  @Patch(":id")
  update(
    @Param() paramIdDto: ParamIdDto,
    @Body() updateOrderDto: UpdateOrderDto
  ) {
    return this.ordersService.update(paramIdDto.id, updateOrderDto);
  }

  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.ordersService.remove(id);
  }

  @Get("user/:userId")
  findByUser(@Param("userId", ParseUUIDPipe) userId: string) {
    return this.ordersService.findByUser(userId);
  }

  @Get("status/:status")
  findByStatus(
    @Param("status", new ParseEnumPipe(OrderStatus)) status: OrderStatus
  ) {
    return this.ordersService.findByStatus(status);
  }

  @Get("payment/:paymentStatus")
  findByPaymentStatus(
    @Param("paymentStatus", new ParseEnumPipe(PaymentStatus))
    paymentStatus: PaymentStatus
  ) {
    return this.ordersService.findByPaymentStatus(paymentStatus);
  }

  // 订单状态管理
  @Patch(":id/status")
  updateOrderStatus(
    @Param() paramIdDto: ParamIdDto,
    @Body() body: { status: OrderStatus }
  ) {
    return this.ordersService.updateOrderStatus(paramIdDto.id, body.status);
  }

  @Patch(":id/payment-status")
  updatePaymentStatus(
    @Param() paramIdDto: ParamIdDto,
    @Body() body: { paymentStatus: PaymentStatus }
  ) {
    return this.ordersService.updatePaymentStatus(
      paramIdDto.id,
      body.paymentStatus
    );
  }

  @Get("stats/overview")
  getOrderStats() {
    return this.ordersService.getOrderStats();
  }
}
