import { ApiProperty } from '@nestjs/swagger';

export class CommonResponse {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  data: object;
}
