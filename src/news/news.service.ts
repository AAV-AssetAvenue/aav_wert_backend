import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {  PaginateModel, PaginateResult } from 'mongoose';
import { News, NewsDocument } from 'src/mongoose/schemas/news.schema';
import { CreateNewsDto } from './dto/news.dto';

@Injectable()
export class NewsService {
  constructor(
    @InjectModel(News.name) private readonly newsModel: PaginateModel<NewsDocument>,
  ) {}

  async create(data: CreateNewsDto,files:{imageUrl:string}): Promise<News> {
    try{
    const createdNews = await this.newsModel.create({
      title: data.title,
      content: data.content,
      imageUrl: files.imageUrl,
      publishedBy: data.publishedBy,
      createdAt:data.date
    });
    return createdNews;
      } catch (error) {
          throw new HttpException(
            error?.message || "Internal server error",
            error.status || HttpStatus.BAD_REQUEST
          );
        }
  }

async findAll(page = 1, limit = 10): Promise<PaginateResult<News>> {
  return this.newsModel.paginate({}, {
    page,
    limit,
    sort: { createdAt: -1 },
  });
}
  async findOne(id: string): Promise<News> {
    const news = await this.newsModel.findById(id).exec();
    if (!news) {
      throw new NotFoundException(`News item with ID ${id} not found`);
    }
    return news;
  }
}