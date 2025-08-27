
import { IsString, IsEmail, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class CreateUserDto {
	@IsString()
	@MaxLength(150)
	name!: string;

	@IsEmail()
	@MaxLength(255)
	email!: string;

	@IsString()
	@MaxLength(255)
	password_hash!: string;

	@IsBoolean()
	@IsOptional()
	is_ative?: boolean;
}
