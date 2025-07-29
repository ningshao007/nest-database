import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'NestJS + TypeORM + PostgreSQL 数据库学习项目';
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };
  }

  @Get('info')
  getInfo() {
    return {
      name: 'NestJS Database Learning Project',
      version: '1.0.0',
      description: '学习 NestJS + TypeORM + PostgreSQL 数据库操作',
      features: [
        '完整的 CRUD 操作',
        '复杂关联关系处理',
        '高级查询和过滤',
        '事务处理',
        '数据验证',
        '分页和搜索',
        '统计和分析'
      ],
      modules: [
        'Users - 用户管理',
        'Products - 产品管理', 
        'Categories - 分类管理',
        'Orders - 订单管理'
      ]
    };
  }
} 