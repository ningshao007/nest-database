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
  ParseEnumPipe,
  ParseUUIDPipe
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UpdateMultipleStatusDto } from "./dto/update-multiple-status.dto";
import { DeleteMultipleDto } from "./dto/delete-multiple.dto";
import { TransferBalanceDto } from "./dto/transfer-balance.dto";
import { UserRole, UserStatus } from "./user.entity";
import { EmailValidationPipe } from "../common/pipes/email-validation.pipe";

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
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }

  @Get("search/query")
  searchUsers(@Query("q") query: string) {
    return this.usersService.searchUsers(query);
  }

  @Get("role/:role")
  findByRole(@Param("role", new ParseEnumPipe(UserRole)) role: UserRole) {
    return this.usersService.findByRole(role);
  }

  @Get("status/:status")
  findByStatus(
    @Param("status", new ParseEnumPipe(UserStatus)) status: UserStatus
  ) {
    return this.usersService.findByStatus(status);
  }

  @Get("email/:email")
  findByEmail(@Param("email", EmailValidationPipe) email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get("username/:username")
  findByUsername(@Param("username") username: string) {
    return this.usersService.findByUsername(username);
  }

  @Get("page/list")
  findWithPagination(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    return this.usersService.findWithPagination(page, limit);
  }

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

  // 软删除操作, 需要有实体支持, @DeleteDateColumn
  @Delete("soft/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  softDelete(@Param("id", ParseUUIDPipe) id: string) {
    return this.usersService.softDelete(id);
  }

  // 恢复软删除的记录
  @Post("restore/:id")
  restore(@Param("id", ParseUUIDPipe) id: string) {
    return this.usersService.restore(id);
  }
}
