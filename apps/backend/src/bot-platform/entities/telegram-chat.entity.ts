import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('telegram_chats')
export class TelegramChat {
  @PrimaryColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  photo?: string;

  @Column({ default: true })
  isActive: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
