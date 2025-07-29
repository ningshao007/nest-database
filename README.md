# NestJS + TypeORM + PostgreSQL 数据库学习项目

这是一个完整的 NestJS 数据库操作学习项目，展示了从简单到复杂的各种数据库操作。

## 🚀 项目特性

- **完整的 CRUD 操作**：用户、产品、分类、订单管理
- **复杂关联关系**：一对多、多对多关系处理
- **高级查询**：分页、搜索、过滤、统计
- **事务处理**：确保数据一致性
- **数据验证**：使用 class-validator 进行输入验证
- **类型安全**：完整的 TypeScript 支持

## 📁 项目结构

```
src/
├── users/           # 用户模块
│   ├── user.entity.ts
│   ├── users.service.ts
│   ├── users.controller.ts
│   ├── users.module.ts
│   └── dto/
├── products/        # 产品模块
│   ├── product.entity.ts
│   ├── products.service.ts
│   ├── products.controller.ts
│   ├── products.module.ts
│   └── dto/
├── categories/      # 分类模块
├── orders/          # 订单模块
│   ├── order.entity.ts
│   ├── order-item.entity.ts
│   ├── orders.service.ts
│   ├── orders.controller.ts
│   └── orders.module.ts
├── app.module.ts    # 主模块
└── main.ts         # 应用入口
```

## 🛠️ 技术栈

- **NestJS**: 企业级 Node.js 框架
- **TypeORM**: 强大的 ORM 框架
- **PostgreSQL**: 关系型数据库
- **TypeScript**: 类型安全的 JavaScript
- **class-validator**: 数据验证
- **class-transformer**: 数据转换

## 📋 数据库设计

### 用户表 (users)
- 基础信息：用户名、邮箱、密码
- 角色管理：管理员、用户、版主
- 状态管理：活跃、非活跃、封禁
- 扩展信息：个人资料、偏好设置

### 产品表 (products)
- 产品信息：名称、描述、SKU、价格
- 库存管理：库存数量、最低库存
- 状态管理：活跃、非活跃、缺货、下架
- 扩展信息：图片、属性、标签、SEO

### 分类表 (categories)
- 分类信息：名称、描述、排序
- 状态管理：是否激活
- 扩展信息：元数据

### 订单表 (orders)
- 订单信息：订单号、状态、支付状态
- 金额计算：小计、税费、运费、折扣、总计
- 地址信息：收货地址、账单地址
- 时间管理：创建、发货、送达、取消时间

### 订单项表 (order_items)
- 订单项信息：数量、单价、总价
- 产品快照：保存下单时的产品信息
- 关联关系：订单、产品

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

复制 `env.example` 为 `.env` 并配置数据库连接：

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=nest_database
```

### 3. 启动应用

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run start:prod
```

## 📚 API 文档

### 用户 API

#### 基础 CRUD
- `POST /api/users` - 创建用户
- `GET /api/users` - 获取所有用户
- `GET /api/users/:id` - 获取单个用户
- `PATCH /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

#### 高级查询
- `GET /api/users/search/query?q=关键词` - 搜索用户
- `GET /api/users/role/:role` - 按角色查询
- `GET /api/users/status/:status` - 按状态查询
- `GET /api/users/page/list?page=1&limit=10` - 分页查询
- `GET /api/users/stats/overview` - 用户统计

#### 批量操作
- `PATCH /api/users/batch/status` - 批量更新状态
- `DELETE /api/users/batch/delete` - 批量删除

#### 事务操作
- `POST /api/users/transfer-balance` - 余额转账

### 产品 API

#### 基础 CRUD
- `POST /api/products` - 创建产品
- `GET /api/products` - 获取所有产品
- `GET /api/products/:id` - 获取单个产品
- `PATCH /api/products/:id` - 更新产品
- `DELETE /api/products/:id` - 删除产品

#### 高级查询
- `GET /api/products/category/:categoryId` - 按分类查询
- `GET /api/products/status/:status` - 按状态查询
- `GET /api/products/search/query?q=关键词` - 搜索产品
- `GET /api/products/price/range?min=10&max=100` - 价格范围查询
- `GET /api/products/stock/in-stock` - 有库存产品
- `GET /api/products/discounted/list` - 折扣产品
- `GET /api/products/popular/list?limit=10` - 热门产品

#### 库存管理
- `PATCH /api/products/:id/stock` - 更新库存
- `POST /api/products/stock/batch-update` - 批量更新库存
- `POST /api/products/:id/increment-sold` - 增加销量
- `POST /api/products/:id/increment-view` - 增加浏览量

### 订单 API

#### 基础 CRUD
- `POST /api/orders` - 创建订单
- `POST /api/orders/with-items` - 创建订单（包含订单项）
- `GET /api/orders` - 获取所有订单
- `GET /api/orders/:id` - 获取单个订单
- `PATCH /api/orders/:id` - 更新订单
- `DELETE /api/orders/:id` - 删除订单

#### 高级查询
- `GET /api/orders/user/:userId` - 用户订单
- `GET /api/orders/status/:status` - 按状态查询
- `GET /api/orders/payment/:paymentStatus` - 按支付状态查询

#### 状态管理
- `PATCH /api/orders/:id/status` - 更新订单状态
- `PATCH /api/orders/:id/payment-status` - 更新支付状态

## 💡 学习要点

### 1. 实体设计
- 使用装饰器定义实体和字段
- 配置字段类型、约束、默认值
- 定义关联关系（一对一、一对多、多对多）
- 使用枚举类型管理状态

### 2. 数据验证
- 使用 class-validator 进行输入验证
- 自定义验证规则和错误消息
- 使用 DTO 进行数据传输

### 3. 查询操作
- 基础 CRUD 操作
- 复杂查询条件
- 关联查询和预加载
- 原生 SQL 查询
- 分页和排序

### 4. 事务处理
- 使用事务确保数据一致性
- 处理复杂的业务逻辑
- 错误回滚机制

### 5. 性能优化
- 使用索引优化查询
- 合理使用关联查询
- 批量操作优化
- 查询结果缓存

## 🔧 开发工具

### 数据库管理
```bash
# 查看数据库连接
npm run typeorm:query "SELECT version()"

# 生成迁移文件
npm run typeorm:generate-migration

# 运行迁移
npm run typeorm:run-migrations
```

### 代码质量
```bash
# 代码格式化
npm run format

# 代码检查
npm run lint

# 运行测试
npm run test
```

## 📝 示例数据

### 创建用户
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user",
  "status": "active"
}
```

### 创建产品
```json
{
  "name": "iPhone 15 Pro",
  "description": "最新款 iPhone",
  "sku": "IPHONE-15-PRO-256",
  "price": 999.99,
  "originalPrice": 1099.99,
  "stockQuantity": 50,
  "minStockLevel": 5,
  "status": "active",
  "type": "physical",
  "categoryId": "category-uuid",
  "tags": ["手机", "苹果", "5G"],
  "images": ["https://example.com/iphone1.jpg"]
}
```

### 创建订单
```json
{
  "userId": "user-uuid",
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "phone": "+1234567890"
  },
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 2
    }
  ],
  "tax": 20.00,
  "shipping": 10.00,
  "discount": 50.00
}
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## �� 许可证

MIT License 