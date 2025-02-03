import {
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

export abstract class BaseModel {
  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
