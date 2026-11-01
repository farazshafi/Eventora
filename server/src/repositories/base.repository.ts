import type { AnyKeys, Model, UpdateQuery } from 'mongoose';
import type { BaseRepository } from './interfaces/base.repository.interface.js';

export abstract class BaseMongoRepository<
  TDocument extends object,
  TEntity,
  TAddInput,
  TUpdateInput = Partial<TEntity>,
> implements BaseRepository<TEntity, TAddInput, TUpdateInput> {
  protected constructor(protected readonly model: Model<TDocument>) {}

  async add(input: TAddInput): Promise<TEntity> {
    const document = await this.model.create(this.toCreateData(input));
    return this.toEntity(document);
  }

  async findById(id: string): Promise<TEntity | null> {
    const document = await this.model.findById(id).lean().exec();
    return document ? this.toEntity(document) : null;
  }

  async updateById(id: string, updates: TUpdateInput): Promise<TEntity | null> {
    const document = await this.model
      .findByIdAndUpdate(id, this.toUpdateData(updates), { new: true, runValidators: true })
      .lean()
      .exec();
    return document ? this.toEntity(document) : null;
  }

  async removeById(id: string): Promise<boolean> {
    const result = await this.model.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  protected abstract toEntity(document: unknown): TEntity;
  protected abstract toCreateData(input: TAddInput): AnyKeys<TDocument>;
  protected abstract toUpdateData(updates: TUpdateInput): UpdateQuery<TDocument>;
}
