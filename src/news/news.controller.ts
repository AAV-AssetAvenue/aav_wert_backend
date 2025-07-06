import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFiles, BadRequestException, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/news.dto';
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { FilesInterceptor } from "@nestjs/platform-express";
import { multerOptions } from "src/config/multer-config";
import { UserRoles } from 'src/mongoose/schemas/user.schema';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @UseInterceptors(FilesInterceptor("files", 1, multerOptions)) // Accept 1 files: News Image
  create(    
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createNewsDto: CreateNewsDto
  ) {
      if (!files || files.length < 1) {
        throw new BadRequestException("image is required.");
      }
        const uploadedFiles = files as unknown as { location: string }[];

    return this.newsService.create(createNewsDto,{    
      imageUrl: uploadedFiles[0].location, // S3 URL for image
    });
  }

@Get()
findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
  return this.newsService.findAll(Number(page), Number(limit));
}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

}
