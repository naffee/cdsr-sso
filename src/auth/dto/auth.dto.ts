import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  IsDate,
  Matches,
  IsStrongPassword,
  IsEnum,
  IsArray,
  IsUrl,
} from 'class-validator';

export class SignUpDto{
  @ApiProperty({example: 'https/\/\image.png'})
  @IsString()
  @IsNotEmpty()
  profileImage: string;

  @ApiProperty({example: 'John'})
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({example: 'PASSWORD123'})
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty({example: 'Doe'})
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  middleName: string;

  @ApiProperty({example: '01234567891'})
  @IsString()
  @IsNotEmpty()
  NIN: string;

  @ApiProperty({ example: 'john.doe@gov.ng' })
  @IsEmail()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9._%+-]+@gov\.ng$/, {
     message: 'officialEmail must end with .gov.ng',
   })
  govIssuedEmail: string;

  @ApiProperty({ example: 'john.doe@gov.ng' })
  @IsEmail()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9._%+-]+@gov\.ng$/, {
     message: 'officialEmail must end with .gov.ng',
   })
  supervisorEmail: string;

  @ApiProperty({example: '01234567891'})
  @IsString()
  @IsNotEmpty()
  BVN: string;

  @ApiProperty({example: '1999-01-01'})
  @IsNotEmpty()
  @IsDate()
  DOB: string;

  @ApiProperty({example: 'JohnDoe@gmail.com'})
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({example: 'Nigeria'})
  @IsString()
  @IsNotEmpty()
  nationality: string;

  @ApiProperty({example: 'AMAC'})
  @IsString()
  @IsNotEmpty()
  LGA: string;

  @ApiProperty({example: 'male'})
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({example: '0708973655'})
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({example: 'NO 5 Somewhere street', description: 'Last known adress'})
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({example: 'Lagos'})
  @IsString()
  @IsNotEmpty()
  stateOfOrigin: string;

  @ApiProperty({example: 'Christainity'})
  @IsString()
  @IsNotEmpty()
  religion: string;

  @ApiProperty({example: 'Yoruba'})
  @IsString()
  @IsNotEmpty()
  tribe: string;


}

export class VerifyOtpDto {
  @ApiProperty({ example: 'john.doe@gov.ng' })
  @IsNotEmpty()
  @IsString()
  govIssuedEmail: string;

  @ApiProperty({ example: '1234' })
  @IsNotEmpty()
  @IsString()
  otp: string;
}

export class ResendOtpDto {
  @ApiProperty({ example: 'john.doe@gov.ng' })
  @IsNotEmpty()
  @IsString()
  govIssuedEmail: string;
}

export class UpdateUserStatusDto {
  @ApiProperty({ example: 'approved' })
  @IsNotEmpty()
  @IsString()
  status: string;
}

export class LoginDto {
  @ApiProperty({ example: 'john.doe@gov.ng' })
  @IsNotEmpty()
  @IsString()
  govIssuedEmail: string;

  @ApiProperty({ example: 'Password123' })
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class UpdatePasswordDto {
  @ApiProperty({ example: '7' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ example: 'Password123' })
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'Password124' })
  @IsNotEmpty()
  @IsString()
  newPassword: string;
}

export class UpdatePasswordNoValidDto {
  @ApiProperty({ example: '7' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ example: 'Password124' })
  @IsNotEmpty()
  @IsString()
  newPassword: string;
}

export class CreateRoleDto {
  @ApiProperty({ example: 'admin' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: ['1', '2', '3'],
    description: 'List of permission IDs to associate with the role',
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  permissions: string[];
}


export class CreatePermissionDto {
  @ApiProperty({ example: 'email' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'for email viewing' })
  @IsOptional()
  @IsString()
  description?: string;
}

