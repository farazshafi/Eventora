export interface BaseRepository<TEntity, TAddInput, TUpdateInput = Partial<TEntity>> {
  add(input: TAddInput): Promise<TEntity>;
  findById(id: string): Promise<TEntity | null>;
  updateById(id: string, updates: TUpdateInput): Promise<TEntity | null>;
  removeById(id: string): Promise<boolean>;
}
