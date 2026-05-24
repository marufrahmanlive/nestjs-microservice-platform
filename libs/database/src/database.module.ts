import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Todo, TodoSchema } from './schemas/todo.schema';
import { Book, BookSchema } from './schemas/book.schema';
import { Post, PostSchema } from './schemas/post.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGO_URI'),
        dbName: configService.get<string>('MONGO_DB_NAME', 'nestjs_db'),
      }),
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Todo.name, schema: TodoSchema },
      { name: Book.name, schema: BookSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
