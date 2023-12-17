import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['chatId'])
export class HelloMessage {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  message: string;

  @Column()
  chatId: number;
}
