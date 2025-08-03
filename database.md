# 数据库设计指南

## 📋 目录

1. [设计原则](#设计原则)
2. [数据库类型选择](#数据库类型选择)
3. [表设计规范](#表设计规范)
4. [字段设计](#字段设计)
5. [索引设计](#索引设计)
6. [关联关系设计](#关联关系设计)
7. [数据完整性](#数据完整性)
8. [性能优化](#性能优化)
9. [安全考虑](#安全考虑)
10. [实际案例分析](#实际案例分析)

## 🎯 设计原则

### 1. 规范化原则

- **第一范式 (1NF)**：确保每个字段都是原子性的，不可再分
- **第二范式 (2NF)**：确保表中的所有非主键字段都完全依赖于主键
- **第三范式 (3NF)**：确保表中的所有非主键字段都不依赖于其他非主键字段

### 2. 命名规范

```sql
-- 表名：使用复数形式，下划线分隔
users, product_categories, order_items

-- 字段名：使用下划线分隔，全小写
user_id, created_at, is_active

-- 索引名：表名_字段名_索引类型
idx_users_email, idx_orders_created_at
```

### 3. 数据类型选择原则

- 选择最小但足够的数据类型
- 考虑数据的实际使用场景
- 注意精度和范围要求

## 🗄️ 数据库类型选择

### 关系型数据库 (RDBMS)

**适用场景：**

- 复杂查询和事务处理
- 数据一致性要求高
- 结构化数据

**推荐：**

- **PostgreSQL**：功能强大，支持JSON、全文搜索
- **MySQL**：广泛使用，性能良好
- **SQL Server**：企业级应用

### 非关系型数据库 (NoSQL)

**适用场景：**

- 大数据量、高并发
- 灵活的数据结构
- 快速读写

**推荐：**

- **MongoDB**：文档型数据库
- **Redis**：内存数据库，缓存
- **Cassandra**：分布式数据库

## 📊 表设计规范

### 1. 基础字段

每个表都应该包含以下基础字段：

```sql
-- 主键
id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- 序列号（用于显示）
sequence_id SERIAL

-- 时间戳
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

-- 软删除
deleted_at TIMESTAMP NULL
```

### 2. 状态字段设计

```sql
-- 使用枚举类型
status ENUM('active', 'inactive', 'pending', 'cancelled')

-- 或者使用整数（节省空间）
status SMALLINT DEFAULT 1 -- 1:active, 2:inactive, 3:pending
```

### 3. 扩展字段

```sql
-- JSON字段存储灵活数据
metadata JSONB

-- 数组字段
tags TEXT[]

-- 地理位置
location POINT
```

## 🔤 字段设计

### 1. 字符串字段

```sql
-- 短文本（用户名、标题）
name VARCHAR(100) NOT NULL

-- 长文本（描述、备注）
description TEXT

-- 唯一标识符
sku VARCHAR(50) UNIQUE NOT NULL

-- 邮箱
email VARCHAR(255) UNIQUE NOT NULL
```

### 2. 数值字段

```sql
-- 整数
quantity INTEGER DEFAULT 0

-- 小数（价格、评分）
price DECIMAL(10,2) NOT NULL
rating DECIMAL(3,2) DEFAULT 0.00

-- 布尔值
is_active BOOLEAN DEFAULT TRUE
```

### 3. 时间字段

```sql
-- 时间戳
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

-- 日期
birth_date DATE

-- 时间
start_time TIME
```

## 🔍 索引设计

### 1. 主键索引

```sql
-- 自动创建
PRIMARY KEY (id)
```

### 2. 唯一索引

```sql
-- 邮箱唯一性
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- 复合唯一索引
CREATE UNIQUE INDEX idx_orders_user_date ON orders(user_id, created_date);
```

### 3. 普通索引

```sql
-- 查询优化
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

### 4. 复合索引

```sql
-- 多字段查询优化
CREATE INDEX idx_products_category_status ON products(category_id, status);
```

### 5. 部分索引

```sql
-- 只对活跃用户建立索引
CREATE INDEX idx_users_active ON users(email) WHERE is_active = TRUE;
```

## 🔗 关联关系设计

### 1. 一对多关系

```sql
-- 用户 -> 订单
-- users表
id UUID PRIMARY KEY

-- orders表
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
```

### 2. 多对多关系

```sql
-- 产品 <-> 分类
-- products表
id UUID PRIMARY KEY

-- categories表
id UUID PRIMARY KEY

-- product_categories表（中间表）
product_id UUID REFERENCES products(id)
category_id UUID REFERENCES categories(id)
PRIMARY KEY (product_id, category_id)
```

### 3. 自关联

```sql
-- 分类层级
-- categories表
id UUID PRIMARY KEY
parent_id UUID REFERENCES categories(id)
```

## 🛡️ 数据完整性

### 1. 外键约束

```sql
-- 级联删除
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

-- 级联更新
FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE CASCADE

-- 限制删除
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT
```

### 2. 检查约束

```sql
-- 价格不能为负数
CHECK (price >= 0)

-- 数量必须大于0
CHECK (quantity > 0)

-- 状态值限制
CHECK (status IN ('active', 'inactive', 'pending'))
```

### 3. 默认值

```sql
-- 设置默认值
status VARCHAR(20) DEFAULT 'active'
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

## ⚡ 性能优化

### 1. 查询优化

```sql
-- 使用EXPLAIN分析查询
EXPLAIN SELECT * FROM products WHERE category_id = 1;

-- 避免SELECT *
SELECT id, name, price FROM products WHERE category_id = 1;

-- 使用LIMIT限制结果
SELECT * FROM orders ORDER BY created_at DESC LIMIT 20;
```

### 2. 分页优化

```sql
-- 使用游标分页（推荐）
SELECT * FROM orders
WHERE created_at < '2024-01-01'
ORDER BY created_at DESC
LIMIT 20;

-- 避免OFFSET大数值
-- 不推荐：SELECT * FROM orders LIMIT 20 OFFSET 10000;
```

### 3. 批量操作

```sql
-- 批量插入
INSERT INTO products (name, price, category_id) VALUES
('Product 1', 10.99, 1),
('Product 2', 20.99, 1),
('Product 3', 30.99, 2);

-- 批量更新
UPDATE products
SET price = price * 1.1
WHERE category_id = 1;
```

## 🔒 安全考虑

### 1. 数据加密

```sql
-- 敏感数据加密
password_hash VARCHAR(255) -- 存储加密后的密码
credit_card_encrypted TEXT -- 加密的信用卡信息
```

### 2. 访问控制

```sql
-- 使用视图限制数据访问
CREATE VIEW user_orders AS
SELECT order_id, total_amount, status
FROM orders
WHERE user_id = current_user_id();

-- 行级安全
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
```

### 3. 审计日志

```sql
-- 审计表
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    table_name VARCHAR(50),
    record_id UUID,
    action VARCHAR(20),
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📝 实际案例分析

### 1. 用户表 (users)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id SERIAL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user',
    status VARCHAR(20) DEFAULT 'active',
    balance DECIMAL(10,2) DEFAULT 0,
    preferences JSONB,
    is_email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
```

### 2. 产品表 (products)

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id SERIAL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    type VARCHAR(20) DEFAULT 'physical',
    weight DECIMAL(5,2) DEFAULT 0,
    weight_unit VARCHAR(10),
    dimensions JSONB,
    images JSONB,
    attributes JSONB,
    tags TEXT[],
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    sold_count INTEGER DEFAULT 0,
    seo JSONB,
    metadata JSONB,
    category_id UUID REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_rating ON products(rating);
```

### 3. 订单表 (orders)

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id SERIAL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending',
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(20),
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    shipping DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    notes TEXT,
    shipping_address JSONB,
    billing_address JSONB,
    estimated_delivery_date DATE,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_order_number ON orders(order_number);
```

### 4. 订单项表 (order_items)

```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id SERIAL,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    product_snapshot JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
```
