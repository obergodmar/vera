import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Duty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chatId: number;

  @Column()
  userId: number;

  @Column()
  dayNumber?: number | null;

  @Column()
  timeFrom?: string | null;

  @Column()
  timeTo?: string | null;

  @Column()
  tag?: string | null;
}
