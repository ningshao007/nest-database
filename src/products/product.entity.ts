import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Category } from "../categories/category.entity";
import { OrderItem } from "../orders/order-item.entity";

export enum ProductStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  OUT_OF_STOCK = "out_of_stock",
  DISCONTINUED = "discontinued",
}

export enum ProductType {
  PHYSICAL = "physical",
  DIGITAL = "digital",
  SERVICE = "service",
}

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "int", generated: "increment" })
  sequenceId: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ length: 100, unique: true })
  sku: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  originalPrice: number;

  @Column({ type: "int", default: 0 })
  stockQuantity: number;

  @Column({ type: "int", default: 0 })
  minStockLevel: number;

  @Column({
    type: "enum",
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status: ProductStatus;

  @Column({
    type: "enum",
    enum: ProductType,
    default: ProductType.PHYSICAL,
  })
  type: ProductType;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  weight: number;

  @Column({ length: 50, nullable: true })
  weightUnit: string;

  @Column({ type: "jsonb", nullable: true })
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };

  @Column({ type: "jsonb", nullable: true })
  images: string[];

  @Column({ type: "jsonb", nullable: true })
  attributes: Record<string, any>;

  @Column({ type: "jsonb", nullable: true })
  tags: string[];

  @Column({ type: "decimal", precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: "int", default: 0 })
  reviewCount: number;

  @Column({ type: "int", default: 0 })
  viewCount: number;

  @Column({ type: "int", default: 0 })
  soldCount: number;

  @Column({ type: "jsonb", nullable: true })
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => Category, (category) => category.products)
  category: Category;

  @Column({ nullable: true })
  categoryId: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  // 虚拟字段
  get isInStock(): boolean {
    return this.stockQuantity > 0 && this.status === ProductStatus.ACTIVE;
  }

  get hasDiscount(): boolean {
    return this.originalPrice && this.originalPrice > this.price;
  }

  get discountPercentage(): number {
    if (!this.hasDiscount) return 0;
    return Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100
    );
  }

  get isLowStock(): boolean {
    return this.stockQuantity <= this.minStockLevel && this.stockQuantity > 0;
  }
}
