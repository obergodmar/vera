import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateNewGreetingDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsNumber()
  peerId: number;
}
