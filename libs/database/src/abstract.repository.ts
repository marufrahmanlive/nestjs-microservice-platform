import { Logger, NotFoundException } from '@nestjs/common';
import { Model, Document, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';

export abstract class AbstractRepository<T extends Document> {
  protected abstract readonly logger: Logger;

  constructor(protected readonly model: Model<T>) {}

  async create(createDto: any): Promise<T> {
    const created = new this.model(createDto);
    return created.save();
  }

  async findOne(filterQuery: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filterQuery);
  }

  async find(filterQuery: FilterQuery<T>, options?: QueryOptions): Promise<T[]> {
    return this.model.find(filterQuery, {}, options);
  }

  async findById(id: string): Promise<T> {
    const doc = await this.model.findById(id);
    if (!doc) {
      throw new NotFoundException(`Document with id ${id} not found`);
    }
    return doc;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<T>,
    updateQuery: UpdateQuery<T>,
    options?: QueryOptions,
  ): Promise<T> {
    const doc = await this.model.findOneAndUpdate(filterQuery, updateQuery, {
      ...options,
      new: true,
    });
    if (!doc) {
      throw new NotFoundException('Document not found');
    }
    return doc;
  }

  async deleteOne(filterQuery: FilterQuery<T>): Promise<T> {
    const doc = await this.model.findOneAndDelete(filterQuery);
    if (!doc) {
      throw new NotFoundException('Document not found');
    }
    return doc;
  }

  async softDelete(filterQuery: FilterQuery<T>): Promise<T> {
    return this.findOneAndUpdate(filterQuery, { deletedAt: new Date() } as UpdateQuery<T>);
  }

  async countDocuments(filterQuery: FilterQuery<T>): Promise<number> {
    return this.model.countDocuments(filterQuery);
  }
}
