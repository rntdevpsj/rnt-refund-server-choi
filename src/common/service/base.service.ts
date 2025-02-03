import { InjectRepository } from '@nestjs/typeorm'
import { Entity, QueryRunner, Repository } from 'typeorm'

export abstract class BaseService<T> {
  protected constructor(
    @InjectRepository(Entity)
    private readonly repository: Repository<T>,
  ) {}

  protected getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<T>(this.repository.target)
      : this.repository
  }
}
