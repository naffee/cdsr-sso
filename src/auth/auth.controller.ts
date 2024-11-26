import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    UseGuards,
    Put,
    Delete,
    NotFoundException,
    UnauthorizedException,
    Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/helper/guards/jwt-auth.guard';
import { CommonResponse } from 'src/helper/common.response';
// import { RolesGuard } from '../../helper/guards/roles.guard';
import { Roles } from 'src/helper/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto,VerifyOtpDto,ResendOtpDto,SignUpDto,UpdateUserStatusDto,UpdatePasswordDto,UpdatePasswordNoValidDto,CreatePermissionDto,CreateRoleDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @ApiTags('Auth')
    @Post('login-admin')
    async loginAdmin(@Body() loginDto: LoginDto): Promise<any> {
    try {
      return await this.authService.loginAdmins(
        loginDto.govIssuedEmail,
        loginDto.password,
      );
    } catch (error) {
      throw new UnauthorizedException('Login failed, Invalid credentials');
    }
    }

    @ApiTags('Auth')
    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<any> {
    try {
      return await this.authService.login(
        loginDto.govIssuedEmail,
        loginDto.password,
      );
    } catch (error) {
      throw new UnauthorizedException('Login failed, Invalid credentials');
    }
    }

    @ApiTags('Auth')
    @Post('verify-otp')
    @ApiOperation({ summary: 'Verify OTP and generate JWT token' })
    @ApiBody({ type: VerifyOtpDto })
    @ApiResponse({ status: 200, description: 'OTP verified, token generated.' })
    async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<CommonResponse> {
        const { govIssuedEmail, otp } = verifyOtpDto;
        return await this.authService.verifyOtp(govIssuedEmail, otp);
    }

    @ApiTags('Auth')
    @Post('resend-otp')
    @ApiOperation({ summary: 'Resend OTP' })
    @ApiBody({ type: ResendOtpDto })
    @ApiResponse({ status: 200, description: 'OTP resent to your email.' })
    async resendOtp(@Body() resendOtpDto: ResendOtpDto): Promise<CommonResponse> {
        const { govIssuedEmail } = resendOtpDto;
        return await this.authService.resendOtp(govIssuedEmail);
    }

    @ApiBearerAuth()
    @ApiTags('Users')
    @Put('user-status/:id')
    @UseGuards(JwtAuthGuard)
    @Roles('admin')
    async updateUserStatus(
    @Param('id') userId: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
    ): Promise<CommonResponse> {
        return this.authService.updateUserStatus(userId, updateUserStatusDto);
    }

    @ApiBearerAuth()
    @ApiTags('Update Password')
    @UseGuards(JwtAuthGuard)
    @Patch('update-password')
    async updatePassword(
      @Body() updatePasswordDto: UpdatePasswordDto,
    ): Promise<CommonResponse> {
      return await this.authService.updatePassword(
        updatePasswordDto.id,
        updatePasswordDto,
      );
    }
  
    @ApiBearerAuth()
    @ApiTags('Update Password No Validation Required')
    @UseGuards(JwtAuthGuard)
    @Patch('update-password-no-validation')
    async updatePasswordNoValidation(
      @Body() updatePasswordNoValidDto: UpdatePasswordNoValidDto,
    ): Promise<CommonResponse> {
      return await this.authService.updatePasswordNoValidation(
        updatePasswordNoValidDto,
      );
    }

    @ApiTags('Roles')
    @Post('roles')
    @UseGuards(JwtAuthGuard)
    @Roles('superAdmin')
    async createRole(
    @Body() createRoleDto: CreateRoleDto,
    ): Promise<CommonResponse> {
        return this.authService.createRole(createRoleDto);
    }

    @ApiTags('Roles')
    @Post('permission')
    @UseGuards(JwtAuthGuard)
    @Roles('superAdmin')
    async createPermission(
    @Body() createPermissionDto: CreatePermissionDto,
    ): Promise<CommonResponse> {
        return this.authService.createPermission(createPermissionDto);
    }

    @ApiBearerAuth()
    @ApiTags('Roles')
    @Put('make-admin/:id')
    @UseGuards(JwtAuthGuard)
    @Roles('superAdmin', 'admin')
    async makeAdmin(@Param('id') userId: string): Promise<CommonResponse> {
        return this.authService.makeAdmin(userId);
    }

    @ApiTags('No Auth for setup only')
    @Post('create-admin-role')
    async createAdminRole(
    @Body() createRoleDto: CreateRoleDto,
    ): Promise<CommonResponse> {
        return this.authService.createAdminRole(createRoleDto);
    }                                                                                                                    
}
