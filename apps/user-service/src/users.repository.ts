import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, AbstractRepository } from '@app/database';

@Injectable()
export class UsersRepository extends AbstractRepository<UserDocument> {
  protected readonly logger = new Logger(UsersRepository.name);

  constructor(@InjectModel(User.name) userModel: Model<UserDocument>) {
    super(userModel);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.findOne({ email });
  }

  async list(skip: number, limit: number) {
    const items = await this.find({}, { skip, limit });
    const total = await this.countDocuments({});
    return { items, total };
  }
}
