import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  cnpj!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;
}
