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
  Not,
  MoreThan,
  LessThan
} from "typeorm";
import { Product, ProductStatus, ProductType } from "./product.entity";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const existingProduct = await this.productsRepository.findOne({
      where: { sku: createProductDto.sku }
    });

    if (existingProduct) {
      throw new ConflictException("SKU 已存在");
    }

    const product = this.productsRepository.create(createProductDto);
    return await this.productsRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return await this.productsRepository.find({
      relations: ["category"]
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ["category", "orderItems"]
    });

    if (!product) {
      throw new NotFoundException(`产品 ID ${id} 不存在`);
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto
  ): Promise<Product> {
    const product = await this.findOne(id);

    // 如果要更新 SKU，检查是否与其他产品冲突
    if (updateProductDto.sku) {
      const existingProduct = await this.productsRepository.findOne({
        where: { sku: updateProductDto.sku, id: Not(id) }
      });

      if (existingProduct) {
        throw new ConflictException("SKU 已被其他产品使用");
      }
    }

    Object.assign(product, updateProductDto);
    return await this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    return await this.productsRepository.find({
      where: { categoryId },
      relations: ["category"]
    });
  }

  async findByStatus(status: ProductStatus): Promise<Product[]> {
    return await this.productsRepository.find({
      where: { status },
      relations: ["category"]
    });
  }

  async findByType(type: ProductType): Promise<Product[]> {
    return await this.productsRepository.find({
      where: { type },
      relations: ["category"]
    });
  }

  async searchProducts(query: string): Promise<Product[]> {
    return await this.productsRepository.find({
      where: [
        { name: Like(`%${query}%`) },
        { description: Like(`%${query}%`) },
        { sku: Like(`%${query}%`) }
      ],
      relations: ["category"],
      order: { createdAt: "DESC" }
    });
  }

  async findByPriceRange(
    minPrice: number,
    maxPrice: number
  ): Promise<Product[]> {
    return await this.productsRepository.find({
      where: {
        price: Between(minPrice, maxPrice),
        status: ProductStatus.ACTIVE
      },
      relations: ["category"],
      order: { price: "ASC" }
    });
  }

  async findInStock(): Promise<Product[]> {
    return await this.productsRepository.find({
      where: {
        stockQuantity: MoreThan(0),
        status: ProductStatus.ACTIVE
      },
      relations: ["category"]
    });
  }

  async findLowStock(): Promise<Product[]> {
    return await this.productsRepository.find({
      where: {
        stockQuantity: LessThan(10),
        status: ProductStatus.ACTIVE
      },
      relations: ["category"]
    });
  }

  async findOutOfStock(): Promise<Product[]> {
    return await this.productsRepository.find({
      where: {
        stockQuantity: 0,
        status: ProductStatus.ACTIVE
      },
      relations: ["category"]
    });
  }

  async findDiscountedProducts(): Promise<Product[]> {
    return await this.productsRepository.find({
      where: {
        originalPrice: Not(IsNull()),
        status: ProductStatus.ACTIVE
      },
      relations: ["category"],
      order: { price: "ASC" }
    });
  }

  async findPopularProducts(limit: number = 10): Promise<Product[]> {
    return await this.productsRepository.find({
      where: { status: ProductStatus.ACTIVE },
      relations: ["category"],
      order: { soldCount: "DESC" },
      take: limit
    });
  }

  async findLatestProducts(limit: number = 10): Promise<Product[]> {
    return await this.productsRepository.find({
      where: { status: ProductStatus.ACTIVE },
      relations: ["category"],
      order: { createdAt: "DESC" },
      take: limit
    });
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10
  ): Promise<{ products: Product[]; total: number }> {
    const [products, total] = await this.productsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ["category"],
      order: { createdAt: "DESC" }
    });

    return { products, total };
  }

  async getStats() {
    const totalProducts = await this.productsRepository.count();
    const activeProducts = await this.productsRepository.count({
      where: { status: ProductStatus.ACTIVE }
    });
    const outOfStockProducts = await this.productsRepository.count({
      where: { stockQuantity: 0 }
    });
    const discountedProducts = await this.productsRepository.count({
      where: { originalPrice: Not(IsNull()) }
    });

    const statusStats = await this.productsRepository
      .createQueryBuilder("product")
      .select("product.status", "status")
      .addSelect("COUNT(*)", "count")
      .groupBy("product.status")
      .getRawMany();

    const typeStats = await this.productsRepository
      .createQueryBuilder("product")
      .select("product.type", "type")
      .addSelect("COUNT(*)", "count")
      .groupBy("product.type")
      .getRawMany();

    const categoryStats = await this.productsRepository
      .createQueryBuilder("product")
      .leftJoin("product.category", "category")
      .select("category.name", "category")
      .addSelect("COUNT(*)", "count")
      .groupBy("category.name")
      .getRawMany();

    return {
      total: totalProducts,
      active: activeProducts,
      outOfStock: outOfStockProducts,
      discounted: discountedProducts,
      statusStats,
      typeStats,
      categoryStats
    };
  }

  async updateStock(productId: string, quantity: number): Promise<Product> {
    const product = await this.findOne(productId);

    const newStock = product.stockQuantity + quantity;
    if (newStock < 0) {
      throw new BadRequestException("库存不足");
    }

    product.stockQuantity = newStock;

    if (newStock === 0) {
      product.status = ProductStatus.OUT_OF_STOCK;
    } else if (product.status === ProductStatus.OUT_OF_STOCK) {
      product.status = ProductStatus.ACTIVE;
    }

    return await this.productsRepository.save(product);
  }

  async updateMultipleStock(
    updates: { productId: string; quantity: number }[]
  ): Promise<void> {
    await this.productsRepository.manager.transaction(async (manager) => {
      for (const update of updates) {
        const product = await manager.findOne(Product, {
          where: { id: update.productId }
        });
        if (!product) continue;

        const newStock = product.stockQuantity + update.quantity;
        if (newStock < 0) continue;

        product.stockQuantity = newStock;
        if (newStock === 0) {
          product.status = ProductStatus.OUT_OF_STOCK;
        } else if (product.status === ProductStatus.OUT_OF_STOCK) {
          product.status = ProductStatus.ACTIVE;
        }

        await manager.save(Product, product);
      }
    });
  }

  async incrementSoldCount(
    productId: string,
    quantity: number = 1
  ): Promise<void> {
    await this.productsRepository.increment(
      { id: productId },
      "soldCount",
      quantity
    );
  }

  async incrementViewCount(productId: string): Promise<void> {
    await this.productsRepository.increment({ id: productId }, "viewCount", 1);
  }

  async updateRating(productId: string, newRating: number): Promise<Product> {
    const product = await this.findOne(productId);

    const totalRating = product.rating * product.reviewCount + newRating;
    product.reviewCount += 1;
    product.rating = totalRating / product.reviewCount;

    return await this.productsRepository.save(product);
  }

  async findProductsWithSalesData(): Promise<any[]> {
    return await this.productsRepository.query(`
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.price,
        p.stock_quantity,
        p.sold_count,
        p.rating,
        p.review_count,
        c.name as category_name,
        COALESCE(SUM(oi.quantity), 0) as total_ordered,
        COALESCE(SUM(oi.quantity * oi.unit_price), 0) as total_revenue
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      WHERE p.status = 'active'
      GROUP BY p.id, p.name, p.sku, p.price, p.stock_quantity, p.sold_count, p.rating, p.review_count, c.name
      ORDER BY total_revenue DESC NULLS LAST
    `);
  }

  // 标签搜索
  async findByTags(tags: string[]): Promise<Product[]> {
    return await this.productsRepository
      .createQueryBuilder("product")
      .where("product.tags @> :tags", { tags: JSON.stringify(tags) })
      .andWhere("product.status = :status", { status: ProductStatus.ACTIVE })
      .leftJoinAndSelect("product.category", "category")
      .getMany();
  }

  // 属性搜索
  async findByAttributes(attributes: Record<string, any>): Promise<Product[]> {
    return await this.productsRepository
      .createQueryBuilder("product")
      .where("product.attributes @> :attributes", {
        attributes: JSON.stringify(attributes)
      })
      .andWhere("product.status = :status", { status: ProductStatus.ACTIVE })
      .leftJoinAndSelect("product.category", "category")
      .getMany();
  }
}
