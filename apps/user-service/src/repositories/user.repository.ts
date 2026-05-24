import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import { AbstractRepository } from '@app/database';

interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  name: string;
  roles: string[];
  isActive: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UserRepository extends AbstractRepository<IUser> {
  protected readonly logger = new Logger(UserRepository.name);

  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {
    super(userModel);
  }

  async updateById(id: string, updateQuery: UpdateQuery<IUser>): Promise<IUser> {
    return this.findOneAndUpdate({ _id: id } as FilterQuery<IUser>, updateQuery);
  }

  async findAndCount(filterQuery: FilterQuery<IUser>, options?: QueryOptions) {
    const [items, total] = await Promise.all([
      this.find(filterQuery, options),
      this.countDocuments(filterQuery),
    ]);
    return { items, total };
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email } as any);
  }
}
