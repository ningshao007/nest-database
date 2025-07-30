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
  DefaultValuePipe,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ParamIdDto } from "./dto/param-id.dto";
import { UpdateMultipleStatusDto } from "./dto/update-multiple-status.dto";
import { DeleteMultipleDto } from "./dto/delete-multiple.dto";
import { TransferBalanceDto } from "./dto/transfer-balance.dto";
import { UserRole, UserStatus } from "./user.entity";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
  findOne(@Param() { id }: ParamIdDto) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  update(@Param() { id }: ParamIdDto, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param() { id }: ParamIdDto) {
    return this.usersService.remove(id);
  }

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
    @Body() updateMultipleStatusDto: UpdateMultipleStatusDto
  ) {
    return this.usersService.updateMultipleStatus(
      updateMultipleStatusDto.userIds,
      updateMultipleStatusDto.status
    );
  }

  @Delete("batch/delete")
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMultiple(@Body() deleteMultipleDto: DeleteMultipleDto) {
    return this.usersService.deleteMultiple(deleteMultipleDto.userIds);
  }

  // 事务操作
  @Post("transfer-balance")
  @HttpCode(HttpStatus.NO_CONTENT)
  transferBalance(@Body() transferBalanceDto: TransferBalanceDto) {
    return this.usersService.transferBalance(
      transferBalanceDto.fromUserId,
      transferBalanceDto.toUserId,
      transferBalanceDto.amount
    );
  }

  // 软删除操作
  @Delete("soft/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  softDelete(@Param() paramIdDto: ParamIdDto) {
    return this.usersService.softDelete(paramIdDto.id);
  }

  @Post("restore/:id")
  restore(@Param() paramIdDto: ParamIdDto) {
    return this.usersService.restore(paramIdDto.id);
  }
}
