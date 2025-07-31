import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Like, IsNull, Not } from "typeorm";
import { User, UserRole, UserStatus } from "./user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email }
      ]
    });

    if (existingUser) {
      throw new ConflictException("用户名或邮箱已存在");
    }

    const user = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({
      select: [
        "id",
        "username",
        "email",
        "firstName",
        "lastName",
        "role",
        "status",
        "createdAt"
      ]
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ["orders"]
    });

    if (!user) {
      throw new NotFoundException(`用户 ID ${id} 不存在`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.username) {
      const existingUser = await this.usersRepository.findOne({
        where: { username: updateUserDto.username, id: Not(id) }
      });

      if (existingUser) {
        throw new ConflictException("用户名已被其他用户使用");
      }
    }

    // 避免查询条件可能是undefined的情况
    if (updateUserDto.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email, id: Not(id) }
      });

      if (existingUser) {
        throw new ConflictException("邮箱已被其他用户使用");
      }
    }

    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async findByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOne({
      where: { email },
      select: ["id", "username", "email", "role", "status"]
    });
  }

  async findByUsername(username: string): Promise<User> {
    return await this.usersRepository.findOne({
      where: { username }
    });
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10
  ): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: "DESC" }
    });

    return { users, total };
  }

  async searchUsers(query: string): Promise<User[]> {
    return await this.usersRepository.find({
      where: [
        { username: Like(`%${query}%`) },
        { email: Like(`%${query}%`) },
        { firstName: Like(`%${query}%`) },
        { lastName: Like(`%${query}%`) }
      ],
      order: { createdAt: "DESC" },
      select: ["id", "username", "email"]
    });
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return await this.usersRepository.find({
      where: { role }
    });
  }

  async findByStatus(status: UserStatus): Promise<User[]> {
    return await this.usersRepository.find({
      where: { status }
    });
  }

  async getStats() {
    const totalUsers = await this.usersRepository.count();
    const activeUsers = await this.usersRepository.count({
      where: { status: UserStatus.ACTIVE }
    });
    const adminUsers = await this.usersRepository.count({
      where: { role: UserRole.ADMIN }
    });

    // SELECT user.role AS "role", COUNT(*) AS "count"
    // FROM users user
    // GROUP BY user.role;
    const roleStats = await this.usersRepository
      .createQueryBuilder("user")
      .select("user.role", "role")
      .addSelect("COUNT(*)", "count")
      .groupBy("user.role")
      .getRawMany();

    const statusStats = await this.usersRepository
      .createQueryBuilder("user")
      .select("user.status", "status")
      .addSelect("COUNT(*)", "count")
      .groupBy("user.status")
      .getRawMany();

    return {
      total: totalUsers,
      active: activeUsers,
      admins: adminUsers,
      roleStats,
      statusStats
    };
  }

  async updateMultipleStatus(
    userIds: string[],
    status: UserStatus
  ): Promise<void> {
    await this.usersRepository.update(userIds, { status });
  }

  async deleteMultiple(userIds: string[]): Promise<void> {
    await this.usersRepository.delete(userIds);
  }

  // TODO: check
  async findActiveUsersWithOrders(): Promise<User[]> {
    return await this.usersRepository.find({
      where: {
        status: UserStatus.ACTIVE,
        orders: Not(IsNull())
      },
      relations: ["orders"],
      order: { createdAt: "DESC" }
    });
  }

  // TODO: check
  async findUsersWithOrderCount(): Promise<any[]> {
    return await this.usersRepository.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        COUNT(o.id) as order_count,
        SUM(o.total_amount) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.status = 'active'
      GROUP BY u.id, u.username, u.email
      ORDER BY total_spent DESC NULLS LAST
    `);
  }

  async transferBalance(
    fromUserId: string,
    toUserId: string,
    amount: number
  ): Promise<void> {
    await this.usersRepository.manager.transaction(async (manager) => {
      // const fromUserResult = await manager.query(
      //   "SELECT id, balance FROM users WHERE id = $1",
      //   [fromUserId]
      // );
      const fromUser = await manager.findOne(User, {
        where: { id: fromUserId },
        select: ["id", "balance"]
      });

      // const toUserResult = await manager.query(
      //   "SELECT id, balance FROM users WHERE id = $1",
      //   [toUserId]
      // );
      const toUser = await manager.findOne(User, {
        where: { id: toUserId },
        select: ["id", "balance"]
      });

      if (!fromUser || !toUser) {
        throw new NotFoundException("用户不存在");
      }

      const transferAmount = parseFloat(amount.toString());
      const fromUserBalance = parseFloat(fromUser.balance.toString());
      const toUserBalance = parseFloat(toUser.balance.toString());

      if (fromUserBalance < transferAmount) {
        throw new BadRequestException("余额不足");
      }

      await manager.query("UPDATE users SET balance = $1 WHERE id = $2", [
        fromUserBalance - transferAmount,
        fromUserId
      ]);

      await manager.query("UPDATE users SET balance = $1 WHERE id = $2", [
        toUserBalance + transferAmount,
        toUserId
      ]);
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.usersRepository.softDelete(id);
  }

  async restore(id: string): Promise<void> {
    await this.usersRepository.restore(id);
  }
}
