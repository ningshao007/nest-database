import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderStatus, PaymentStatus } from './order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: any) {
    return this.ordersService.create(createOrderDto);
  }

  @Post('with-items')
  createOrderWithItems(@Body() orderData: any) {
    return this.ordersService.createOrderWithItems(orderData);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: any) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }

  // 高级查询
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.ordersService.findByUser(userId);
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: OrderStatus) {
    return this.ordersService.findByStatus(status);
  }

  @Get('payment/:paymentStatus')
  findByPaymentStatus(@Param('paymentStatus') paymentStatus: PaymentStatus) {
    return this.ordersService.findByPaymentStatus(paymentStatus);
  }

  // 订单状态管理
  @Patch(':id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: OrderStatus }
  ) {
    return this.ordersService.updateOrderStatus(id, body.status);
  }

  @Patch(':id/payment-status')
  updatePaymentStatus(
    @Param('id') id: string,
    @Body() body: { paymentStatus: PaymentStatus }
  ) {
    return this.ordersService.updatePaymentStatus(id, body.paymentStatus);
  }

  // 统计信息
  @Get('stats/overview')
  getOrderStats() {
    return this.ordersService.getOrderStats();
  }
} 