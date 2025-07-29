import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Repository,
  FindOptionsWhere,
  Like,
  Between,
  In,
  IsNull,
  Not
} from "typeorm";
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
    try {
      const user = await this.usersRepository.findOne({
        where: { id }
        // relations: ["orders"]
      });

      if (!user) {
        throw new NotFoundException(`用户 ID ${id} 不存在`);
      }

      return user;
    } catch (error) {
      // 如果是 NotFoundException，直接抛出
      if (error instanceof NotFoundException) {
        throw error;
      }

      // 如果是数据库连接错误或其他错误，记录日志并抛出更友好的错误
      console.error("查询用户时发生错误:", error);
      throw new NotFoundException(`查询用户时发生错误: ${error.message}`);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // 如果要更新用户名或邮箱，检查是否与其他用户冲突
    if (updateUserDto.username || updateUserDto.email) {
      const existingUser = await this.usersRepository.findOne({
        where: [
          { username: updateUserDto.username, id: Not(id) },
          { email: updateUserDto.email, id: Not(id) }
        ]
      });

      if (existingUser) {
        throw new ConflictException("用户名或邮箱已被其他用户使用");
      }
    }

    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  // 高级查询操作

  async findByEmail(email: string): Promise<User> {
    return await this.usersRepository.findOne({
      where: { email },
      select: ["id", "username", "email", "password", "role", "status"]
    });
  }

  async findByUsername(username: string): Promise<User> {
    return await this.usersRepository.findOne({
      where: { username }
    });
  }

  // 分页查询
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

  // 搜索用户
  async searchUsers(query: string): Promise<User[]> {
    return await this.usersRepository.find({
      where: [
        { username: Like(`%${query}%`) },
        { email: Like(`%${query}%`) },
        { firstName: Like(`%${query}%`) },
        { lastName: Like(`%${query}%`) }
      ],
      order: { createdAt: "DESC" }
    });
  }

  // 按角色查询
  async findByRole(role: UserRole): Promise<User[]> {
    return await this.usersRepository.find({
      where: { role }
    });
  }

  // 按状态查询
  async findByStatus(status: UserStatus): Promise<User[]> {
    return await this.usersRepository.find({
      where: { status }
    });
  }

  // 统计操作
  async getStats() {
    const totalUsers = await this.usersRepository.count();
    const activeUsers = await this.usersRepository.count({
      where: { status: UserStatus.ACTIVE }
    });
    const adminUsers = await this.usersRepository.count({
      where: { role: UserRole.ADMIN }
    });

    // 按角色统计
    const roleStats = await this.usersRepository
      .createQueryBuilder("user")
      .select("user.role", "role")
      .addSelect("COUNT(*)", "count")
      .groupBy("user.role")
      .getRawMany();

    // 按状态统计
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

  // 批量操作
  async updateMultipleStatus(
    userIds: string[],
    status: UserStatus
  ): Promise<void> {
    await this.usersRepository.update(userIds, { status });
  }

  async deleteMultiple(userIds: string[]): Promise<void> {
    await this.usersRepository.delete(userIds);
  }

  // 复杂查询示例
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

  // 原生 SQL 查询示例
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

  // 事务操作示例
  async transferBalance(
    fromUserId: string,
    toUserId: string,
    amount: number
  ): Promise<void> {
    await this.usersRepository.manager.transaction(async (manager) => {
      const fromUser = await manager.findOne(User, {
        where: { id: fromUserId }
      });
      const toUser = await manager.findOne(User, { where: { id: toUserId } });

      if (!fromUser || !toUser) {
        throw new NotFoundException("用户不存在");
      }

      if (fromUser.balance < amount) {
        throw new BadRequestException("余额不足");
      }

      fromUser.balance -= amount;
      toUser.balance += amount;

      await manager.save(User, [fromUser, toUser]);
    });
  }

  // 软删除示例（如果实体支持）
  async softDelete(id: string): Promise<void> {
    await this.usersRepository.softDelete(id);
  }

  // 恢复软删除的记录
  async restore(id: string): Promise<void> {
    await this.usersRepository.restore(id);
  }
}
