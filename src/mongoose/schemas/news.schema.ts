import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import * as mongoosePaginate from "mongoose-paginate-v2";

export type NewsDocument = HydratedDocument<News>;


@Schema({
  timestamps: true,
})
export class News {

  @Prop({
    required: true,
    type: String,
  })  
  title: string;
  @Prop({
    required: true,
    type: String,
  })
  content: string;
  @Prop({
    required: true,
    type: String,
  })
  imageUrl: string;

    @Prop({
    required: true,
    type: String,
  })
  publishedBy: string;

}

export const NewsSchema = SchemaFactory.createForClass(News);
NewsSchema.plugin(mongoosePaginate);
