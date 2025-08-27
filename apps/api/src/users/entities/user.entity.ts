
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
	@PrimaryGeneratedColumn('increment', { type: 'bigint' })
		id!: string;

	@Column({ type: 'varchar', length: 150 })
		name!: string;

	@Column({ type: 'varchar', length: 255, unique: true })
		email!: string;

	@Column({ type: 'varchar', length: 255, name: 'password_hash' })
		password_hash!: string;

	@Column({ type: 'boolean', default: true, name: 'is_active' })
		is_active!: boolean;

	@CreateDateColumn({ type: 'timestamp', name: 'created_at' })
		created_at!: Date;

	@UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
		updated_at!: Date;
	@Column({ type: 'timestamp', name: 'deleted_at', nullable: true })
	deleted_at!: Date | null;
}
