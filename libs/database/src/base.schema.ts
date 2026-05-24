import { Prop, Schema } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

/**
 * BaseSchema gives every document:
 *   - createdAt / updatedAt (auto via timestamps:true on the concrete schema)
 *   - deletedAt for soft-delete (filtered out by AbstractRepository when omitDeleted=true)
 *   - version for optimistic locking on hot rows if needed
 *
 * Concrete schemas should:
 *   @Schema({ timestamps: true, collection: 'X' })
 *   class X extends BaseSchema {}
 */
@Schema({ _id: false })
export class BaseSchema {
  _id!: Types.ObjectId;

  @Prop({ type: SchemaTypes.Date, default: null, index: true })
  deletedAt?: Date | null;

  @Prop({ type: Number, default: 0 })
  __v?: number;

  createdAt?: Date;
  updatedAt?: Date;
}
