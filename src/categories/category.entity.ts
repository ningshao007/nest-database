import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from "typeorm";
import { Product } from "../products/product.entity";

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "int", generated: "increment" })
  sequenceId: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ length: 100, nullable: true })
  slug: string;

  @Column({ type: "int", default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 关联关系
  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  // 虚拟字段 - 用于显示序号（不存储在数据库中）
  get displayId(): string {
    return `CAT-${this.id.slice(0, 8).toUpperCase()}`;
  }
}
