import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { ParamIdDto } from "./dto/param-id.dto";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: any) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(":id")
  findOne(@Param() paramIdDto: ParamIdDto) {
    return this.categoriesService.findOne(paramIdDto.id);
  }

  @Patch(":id")
  update(@Param() paramIdDto: ParamIdDto, @Body() updateCategoryDto: any) {
    return this.categoriesService.update(paramIdDto.id, updateCategoryDto);
  }

  @Delete(":id")
  remove(@Param() paramIdDto: ParamIdDto) {
    return this.categoriesService.remove(paramIdDto.id);
  }
}
