import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class HelloMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @Column()
  chatId: number;
}
