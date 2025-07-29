import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ParamIdDto } from "./dto/param-id.dto";
import { ProductStatus, ProductType } from "./product.entity";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(":id")
  findOne(@Param() paramIdDto: ParamIdDto) {
    return this.productsService.findOne(paramIdDto.id);
  }

  @Patch(":id")
  update(
    @Param() paramIdDto: ParamIdDto,
    @Body() updateProductDto: UpdateProductDto
  ) {
    return this.productsService.update(paramIdDto.id, updateProductDto);
  }

  @Delete(":id")
  remove(@Param() paramIdDto: ParamIdDto) {
    return this.productsService.remove(paramIdDto.id);
  }

  // 高级查询
  @Get("category/:categoryId")
  findByCategory(@Param("categoryId") categoryId: string) {
    return this.productsService.findByCategory(categoryId);
  }

  @Get("status/:status")
  findByStatus(@Param("status") status: ProductStatus) {
    return this.productsService.findByStatus(status);
  }

  @Get("type/:type")
  findByType(@Param("type") type: ProductType) {
    return this.productsService.findByType(type);
  }

  @Get("search/query")
  searchProducts(@Query("q") query: string) {
    return this.productsService.searchProducts(query);
  }

  @Get("price/range")
  findByPriceRange(
    @Query("min") minPrice: number,
    @Query("max") maxPrice: number
  ) {
    return this.productsService.findByPriceRange(minPrice, maxPrice);
  }

  @Get("stock/in-stock")
  findInStock() {
    return this.productsService.findInStock();
  }

  @Get("stock/low-stock")
  findLowStock() {
    return this.productsService.findLowStock();
  }

  @Get("stock/out-of-stock")
  findOutOfStock() {
    return this.productsService.findOutOfStock();
  }

  @Get("discounted/list")
  findDiscountedProducts() {
    return this.productsService.findDiscountedProducts();
  }

  @Get("popular/list")
  findPopularProducts(
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    return this.productsService.findPopularProducts(limit);
  }

  @Get("latest/list")
  findLatestProducts(
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    return this.productsService.findLatestProducts(limit);
  }

  @Get("page/list")
  findWithPagination(
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    return this.productsService.findWithPagination(page, limit);
  }

  @Get("stats/overview")
  getStats() {
    return this.productsService.getStats();
  }

  @Get("sales/data")
  findProductsWithSalesData() {
    return this.productsService.findProductsWithSalesData();
  }

  @Get("tags/search")
  findByTags(@Query("tags") tags: string) {
    const tagArray = tags.split(",").map((tag) => tag.trim());
    return this.productsService.findByTags(tagArray);
  }

  @Post("attributes/search")
  findByAttributes(@Body() attributes: Record<string, any>) {
    return this.productsService.findByAttributes(attributes);
  }

  // 库存管理
  @Patch(":id/stock")
  updateStock(
    @Param() paramIdDto: ParamIdDto,
    @Body() body: { quantity: number }
  ) {
    return this.productsService.updateStock(paramIdDto.id, body.quantity);
  }

  @Post("stock/batch-update")
  updateMultipleStock(
    @Body() updates: { productId: string; quantity: number }[]
  ) {
    return this.productsService.updateMultipleStock(updates);
  }

  @Post(":id/increment-sold")
  incrementSoldCount(
    @Param() paramIdDto: ParamIdDto,
    @Body() body: { quantity?: number }
  ) {
    return this.productsService.incrementSoldCount(
      paramIdDto.id,
      body.quantity || 1
    );
  }

  @Post(":id/increment-view")
  incrementViewCount(@Param() paramIdDto: ParamIdDto) {
    return this.productsService.incrementViewCount(paramIdDto.id);
  }

  @Post(":id/update-rating")
  updateRating(
    @Param() paramIdDto: ParamIdDto,
    @Body() body: { rating: number }
  ) {
    return this.productsService.updateRating(paramIdDto.id, body.rating);
  }
}
