import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserRole, UserStatus } from "./user.entity";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 基础 CRUD 操作

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }

  // 高级查询操作

  @Get("search/query")
  searchUsers(@Query("q") query: string) {
    return this.usersService.searchUsers(query);
  }

  @Get("role/:role")
  findByRole(@Param("role") role: UserRole) {
    return this.usersService.findByRole(role);
  }

  @Get("status/:status")
  findByStatus(@Param("status") status: UserStatus) {
    return this.usersService.findByStatus(status);
  }

  @Get("email/:email")
  findByEmail(@Param("email") email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get("username/:username")
  findByUsername(@Param("username") username: string) {
    return this.usersService.findByUsername(username);
  }

  // 分页查询
  @Get("page/list")
  findWithPagination(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    return this.usersService.findWithPagination(page, limit);
  }

  // 统计信息
  @Get("stats/overview")
  getStats() {
    return this.usersService.getStats();
  }

  // 复杂查询
  @Get("active/with-orders")
  findActiveUsersWithOrders() {
    return this.usersService.findActiveUsersWithOrders();
  }

  @Get("with-order-count")
  findUsersWithOrderCount() {
    return this.usersService.findUsersWithOrderCount();
  }

  // 批量操作
  @Patch("batch/status")
  @HttpCode(HttpStatus.NO_CONTENT)
  updateMultipleStatus(
    @Body() body: { userIds: string[]; status: UserStatus }
  ) {
    return this.usersService.updateMultipleStatus(body.userIds, body.status);
  }

  @Delete("batch/delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMultiple(@Body() body: { userIds: string[] }) {
    return this.usersService.deleteMultiple(body.userIds);
  }

  // 事务操作
  @Post("transfer-balance")
  @HttpCode(HttpStatus.NO_CONTENT)
  transferBalance(
    @Body() body: { fromUserId: string; toUserId: string; amount: number }
  ) {
    return this.usersService.transferBalance(
      body.fromUserId,
      body.toUserId,
      body.amount
    );
  }

  // 软删除操作
  @Delete("soft/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  softDelete(@Param("id") id: string) {
    return this.usersService.softDelete(id);
  }

  @Post("restore/:id")
  restore(@Param("id") id: string) {
    return this.usersService.restore(id);
  }
}
