import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);
  constructor(private authService: AuthService) {
    super();
  }

  async validate(
    govIssuedEmail: string,
    password: string,
  ): Promise<any> {
    this.logger.log(`Validating credentials for ${govIssuedEmail}`);
    this.logger.log(`Validating credentials for ${govIssuedEmail}`);
    console.log('govIssuedEmail', govIssuedEmail,);
    const user = await this.authService.login(govIssuedEmail, password);

    if (!user) {
      throw new UnauthorizedException('wrong username or password');
    }

    return user;
  }
}
