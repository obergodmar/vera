import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Convo {
  @PrimaryColumn()
  id: number;
}
