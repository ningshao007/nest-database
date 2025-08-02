import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order, OrderStatus, PaymentStatus } from "./order.entity";
import { OrderItem } from "./order-item.entity";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { ProductsService } from "../products/products.service";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    private productsService: ProductsService
  ) {}

  async create(createOrderDto: any): Promise<Order> {
    const order = this.ordersRepository.create(createOrderDto);
    return (await this.ordersRepository.save(order)) as any;
  }

  async findAll(): Promise<Order[]> {
    return await this.ordersRepository.find({
      relations: ["user", "orderItems", "orderItems.product"],
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ["user", "orderItems", "orderItems.product"],
    });

    if (!order) {
      throw new NotFoundException(`订单 ID ${id} 不存在`);
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    if (
      updateOrderDto.orderNumber &&
      updateOrderDto.orderNumber !== order.orderNumber
    ) {
      const existingOrder = await this.ordersRepository.findOne({
        where: { orderNumber: updateOrderDto.orderNumber },
      });

      if (existingOrder) {
        throw new ConflictException(
          `订单号 ${updateOrderDto.orderNumber} 已存在`
        );
      }
    }

    Object.assign(order, updateOrderDto);
    return await this.ordersRepository.save(order);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.ordersRepository.remove(order);
  }

  async createOrderWithItems(orderData: any): Promise<Order> {
    return await this.ordersRepository.manager.transaction(async (manager) => {
      const order = manager.create(Order, {
        orderNumber: this.generateOrderNumber(),
        userId: orderData.userId,
        subtotal: 0,
        totalAmount: 0,
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress,
        notes: orderData.notes,
      });

      const savedOrder = await manager.save(Order, order);

      // 创建订单项
      let subtotal = 0;
      const orderItems = [];

      for (const item of orderData.items) {
        const product = await this.productsService.findOne(item.productId);

        if (product.stockQuantity < item.quantity) {
          throw new BadRequestException(`产品 ${product.name} 库存不足`);
        }

        const orderItem = manager.create(OrderItem, {
          orderId: savedOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          totalPrice: product.price * item.quantity,
          productSnapshot: {
            id: product.id,
            name: product.name,
            sku: product.sku,
            price: product.price,
            images: product.images,
          },
        });

        orderItems.push(orderItem);
        subtotal += orderItem.totalPrice;

        // 更新产品库存
        await this.productsService.updateStock(item.productId, -item.quantity);
        await this.productsService.incrementSoldCount(
          item.productId,
          item.quantity
        );
      }

      await manager.save(OrderItem, orderItems);

      // 更新订单总金额
      savedOrder.subtotal = subtotal;
      savedOrder.totalAmount =
        subtotal +
        (orderData.tax || 0) +
        (orderData.shipping || 0) -
        (orderData.discount || 0);

      return await manager.save(Order, savedOrder);
    });
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<Order> {
    const order = await this.findOne(orderId);

    order.status = status;

    switch (status) {
      case OrderStatus.SHIPPED:
        order.shippedAt = new Date();
        break;
      case OrderStatus.DELIVERED:
        order.deliveredAt = new Date();
        break;
      case OrderStatus.CANCELLED:
        order.cancelledAt = new Date();
        break;
    }

    return await this.ordersRepository.save(order);
  }

  async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus
  ): Promise<Order> {
    const order = await this.findOne(orderId);
    order.paymentStatus = paymentStatus;
    return await this.ordersRepository.save(order);
  }

  async findByUser(userId: string): Promise<Order[]> {
    return await this.ordersRepository.find({
      where: { userId },
      relations: ["orderItems", "orderItems.product"],
      order: { createdAt: "DESC" },
    });
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    return await this.ordersRepository.find({
      where: { status },
      relations: ["user", "orderItems"],
      order: { createdAt: "DESC" },
    });
  }

  async findByPaymentStatus(paymentStatus: PaymentStatus): Promise<Order[]> {
    return await this.ordersRepository.find({
      where: { paymentStatus },
      relations: ["user", "orderItems"],
      order: { createdAt: "DESC" },
    });
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `ORD${timestamp}${random}`;
  }

  async getOrderStats() {
    const totalOrders = await this.ordersRepository.count();
    const pendingOrders = await this.ordersRepository.count({
      where: { status: OrderStatus.PENDING },
    });
    const completedOrders = await this.ordersRepository.count({
      where: { status: OrderStatus.DELIVERED },
    });
    const cancelledOrders = await this.ordersRepository.count({
      where: { status: OrderStatus.CANCELLED },
    });

    const statusStats = await this.ordersRepository
      .createQueryBuilder("order")
      .select("order.status", "status")
      .addSelect("COUNT(*)", "count")
      .groupBy("order.status")
      .getRawMany();

    const paymentStats = await this.ordersRepository
      .createQueryBuilder("order")
      .select("order.payment_status", "paymentStatus")
      .addSelect("COUNT(*)", "count")
      .groupBy("order.payment_status")
      .getRawMany();

    return {
      total: totalOrders,
      pending: pendingOrders,
      completed: completedOrders,
      cancelled: cancelledOrders,
      statusStats,
      paymentStats,
    };
  }
}
