import {
  IsUUID,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
  IsObject,
} from "class-validator";
import { Type } from "class-transformer";
import { OrderStatus, PaymentStatus, PaymentMethod } from "../order.entity";

export class AddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  postalCode: string;

  @IsString()
  country: string;
}

export class OrderItemDto {
  @IsUUID("4", { message: "商品ID必须是有效的UUID格式" })
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  totalPrice: number;

  @IsOptional()
  @IsNumber()
  discount?: number;
}

export class CreateOrderDto {
  @IsUUID("4", { message: "用户ID必须是有效的UUID格式" })
  userId: string;

  @IsString()
  orderNumber: string;

  @IsNumber()
  totalAmount: number;

  @IsNumber()
  subtotal: number;

  @IsOptional()
  @IsNumber()
  tax?: number;

  @IsOptional()
  @IsNumber()
  shipping?: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress: AddressDto;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];
}
