import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany
} from "typeorm";
import { Order } from "../orders/order.entity";

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  MODERATOR = "moderator"
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BANNED = "banned"
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "int", generated: "increment" })
  sequenceId: number;

  @Column({ length: 100, unique: true })
  username: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255, select: false }) // select: false 默认不查询密码字段
  password: string;

  @Column({ length: 100, nullable: true })
  firstName: string;

  @Column({ length: 100, nullable: true })
  lastName: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.ACTIVE
  })
  status: UserStatus;

  @Column({ type: "text", nullable: true })
  bio: string;

  @Column({ type: "date", nullable: true })
  birthDate: Date;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ type: "jsonb", nullable: true })
  preferences: Record<string, any>;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // 关联关系
  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  // 虚拟字段（不存储在数据库中）
  get fullName(): string {
    return `${this.firstName || ""} ${this.lastName || ""}`.trim();
  }

  get isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }
}
