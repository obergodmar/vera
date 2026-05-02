import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('telegram_chat_members')
export class TelegramChatMember {
  @PrimaryColumn({ type: 'bigint', unsigned: true })
  chatId: number;

  @PrimaryColumn({ type: 'bigint', unsigned: true })
  userId: number;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  username?: string;

  @Column({ nullable: true })
  photo?: string;

  @Column({ default: true })
  isActive: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
