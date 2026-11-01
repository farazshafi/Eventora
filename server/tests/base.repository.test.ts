import type { Model, UpdateQuery } from 'mongoose';
import { describe, expect, it, vi } from 'vitest';
import { BaseMongoRepository } from '../src/repositories/base.repository.js';

interface TestDocument {
  name: string;
  count: number;
}

interface TestEntity extends TestDocument {
  id: string;
}

class TestRepository extends BaseMongoRepository<
  TestDocument,
  TestEntity,
  Pick<TestEntity, 'name' | 'count'>
> {
  protected toEntity(document: unknown): TestEntity {
    return document as TestEntity;
  }

  protected toCreateData(input: Pick<TestEntity, 'name' | 'count'>): TestDocument {
    return input;
  }

  protected toUpdateData(updates: Partial<TestEntity>): UpdateQuery<TestDocument> {
    const fields = { ...updates };
    delete fields.id;
    return fields;
  }
}

function repositoryFor(model: object): TestRepository {
  return new TestRepository(model as Model<TestDocument>);
}

describe('BaseMongoRepository', () => {
  it('adds records and maps the created document', async () => {
    const created = { id: 'record-1', name: 'Room', count: 2 };
    const create = vi.fn(async () => created);
    const repository = repositoryFor({ create });

    await expect(repository.add({ name: 'Room', count: 2 })).resolves.toEqual(created);
    expect(create).toHaveBeenCalledWith({ name: 'Room', count: 2 });
  });

  it('finds records by id and returns null when missing', async () => {
    const findById = vi
      .fn()
      .mockReturnValueOnce({
        lean: () => ({ exec: async () => ({ id: 'record-1', name: 'Room', count: 2 }) }),
      })
      .mockReturnValueOnce({ lean: () => ({ exec: async () => null }) });
    const repository = repositoryFor({ findById });

    await expect(repository.findById('record-1')).resolves.toEqual({
      id: 'record-1',
      name: 'Room',
      count: 2,
    });
    await expect(repository.findById('missing')).resolves.toBeNull();
  });

  it('updates with validators and returns null when the record is missing', async () => {
    const findByIdAndUpdate = vi
      .fn()
      .mockReturnValueOnce({
        lean: () => ({ exec: async () => ({ id: 'record-1', name: 'Updated', count: 3 }) }),
      })
      .mockReturnValueOnce({ lean: () => ({ exec: async () => null }) });
    const repository = repositoryFor({ findByIdAndUpdate });

    await expect(repository.updateById('record-1', { name: 'Updated' })).resolves.toEqual({
      id: 'record-1',
      name: 'Updated',
      count: 3,
    });
    expect(findByIdAndUpdate).toHaveBeenCalledWith(
      'record-1',
      { name: 'Updated' },
      { new: true, runValidators: true },
    );
    await expect(repository.updateById('missing', { name: 'Updated' })).resolves.toBeNull();
  });

  it('returns true only when a record was removed', async () => {
    const deleteOne = vi
      .fn()
      .mockReturnValueOnce({ exec: async () => ({ deletedCount: 1 }) })
      .mockReturnValueOnce({ exec: async () => ({ deletedCount: 0 }) });
    const repository = repositoryFor({ deleteOne });

    await expect(repository.removeById('record-1')).resolves.toBe(true);
    await expect(repository.removeById('missing')).resolves.toBe(false);
    expect(deleteOne).toHaveBeenCalledWith({ _id: 'record-1' });
  });
});
