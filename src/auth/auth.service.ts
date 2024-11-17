import { Injectable,Logger,NotFoundException,UnauthorizedException,ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { CommonResponse } from 'src/helper/common.response';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { Helper } from 'src/helper/common.helper';
import { UserEntity } from 'src/database/entities/user.entity';
import { RoleEntity } from 'src/database/entities/role.entity';
import { PermissionEntity } from 'src/database/entities/permission.entity';
import { SignUpDto,UpdateUserStatusDto,UpdatePasswordDto,UpdatePasswordNoValidDto,CreatePermissionDto,CreateRoleDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    private logger = new Logger(AuthService.name);

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>,
        @InjectRepository(PermissionEntity)
        private readonly permissionRepository: Repository<PermissionEntity>,
        private readonly mailService: MailService,
        private jwtService: JwtService,
    )   { }

    async getJwtToken(user: UserEntity): Promise<any> {
        this.logger.log(`Generating JWT token for user ${user.roles}`);
        const payload = {
          govIssuedEmail: user.govIssuedEmail,
          dob: user.DOB,
          nin: user?.NIN,
          bvn: user.BVN,
          //status: user?.status,
          roles: user.roles?.map((role) => role.name) || [],
        };
    
        // Generate Access Token
        const token = this.jwtService.sign(payload);
    
        // Generate Refresh Token
        const refreshToken = uuidv4();
        const refreshTokenExpiry = new Date();
        refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 1);
    
        // Update user with refresh token information
        await this.userRepository.update(user.id, {
          refreshToken: refreshToken,
          refreshTokenExpiry: refreshTokenExpiry,
        });
    
        return {
          user: user,
          token: token,
          refreshToken: refreshToken,
        };
    }

    async sendOtp(user: UserEntity): Promise<void> {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 20 * 60 * 1000);
    
        await this.userRepository.update(user.id, { otp, otpExpiry });
    
        await this.mailService.sendMail({
          to: user.govIssuedEmail,
          subject: 'Your OTP Code',
          text: `Your OTP code is ${otp}. It will expire in 20 minutes.`,
        });
    }
    
    async verifyOtp(govIssuedEmail: string, otp: string): Promise<any> {
        const user = await this.userRepository.findOne({
          where: { govIssuedEmail },
        });
    
        if (!user || user.otp !== otp || user.otpExpiry < new Date()) {
          throw new UnauthorizedException('Invalid or expired OTP');
        }
    
        await this.userRepository.update(user.id, { otp: null, otpExpiry: null });
    
        await this.mailService.sendMail({
          to: user.govIssuedEmail,
          subject: 'You have logged into your account',
          text: `A user just logged into your account. If this wasn't you, please contact the admin to restrict your account.`,
        });
    
        return await this.getJwtToken(user);
    }
    
    async resendOtp(govIssuedEmail: string): Promise<any> {
        const user = await this.userRepository.findOne({
          where: { govIssuedEmail },
        });
    
        if (!user) {
          throw new UnauthorizedException('User not found');
        }
    
        return await this.sendOtp(user);
    }

    async registerUser(signUpDto: SignUpDto): Promise<CommonResponse> {
        const existingUser = await this.userRepository.findOne({
          where: { govIssuedEmail: signUpDto.govIssuedEmail },
        });
    
        if (existingUser) {
          throw new ConflictException(
            'Official Email address is already registered.',
          );
        }
    
        // const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
        const user = this.userRepository.create({
          ...signUpDto,
          // password: hashedPassword,
        });
        await this.userRepository.save(user);
    
        await this.mailService.sendMail({
          to: user.govIssuedEmail,
          subject: 'New User Registration Request',
          text: `You have requested to join CDSR Ecosystem. Reach out to the admin if your account is not approved within 24hours.`,
        });
    
        await this.mailService.sendMail({
          to: user.supervisorEmail,
          subject: 'New User Registration Request',
          text: `A user has access requested to join the CCPPAS Ecosystem. Verify that the user works in your organization before approving the user. The user's details are as follows: Email: ${user.supervisorEmail}, `,
        });
    
        return {
          statusCode: 201,
          message: 'User registered successfully',
          data: user,
        };
    }

    async updateUserStatus(
        userId: string,
        updateUserStatusDto: UpdateUserStatusDto,
      ): Promise<CommonResponse> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
    
        if (!user) {
          return {
            statusCode: 404,
            message: 'User not found',
            data: null,
          };
        }
    
        user.status = updateUserStatusDto.status;
    
        let emailText: string;
    
        if (updateUserStatusDto.status === 'approved') {
          const generatedPassword = await Helper.generateRandomPassword();
          const hashedPassword = await bcrypt.hash(generatedPassword, 10);
    
          user.password = hashedPassword;
          emailText = `Your access has been approved. You can now login with the password: ${generatedPassword}`;
        } else {
          emailText = `Your account was not approved, please contact the admin/supervisor if you think this is a mistake.`;
        }
    
        await this.userRepository.save(user);
    
        await this.mailService.sendMail({
          to: user.govIssuedEmail,
          subject: 'CDSR Access Update',
          text: emailText,
        });
    
        return {
          statusCode: 200,
          message: `User status updated to ${user.status}`,
          data: user,
        };
    }

    async login(
        govIssuedEmail: string,
        password: string,
      ): Promise<any> {
        this.logger.log(`Attempting login for user with email ${govIssuedEmail}`);
        try {
    
          // const user = await this.userRepository.findOne({
          //   where: [{ officialEmail: officialEmail }, { govId: govId }],
          //   relations: ['department', 'roles'],
          // });
          
          const user = await this.userRepository.findOne({
            where: {
              govIssuedEmail: govIssuedEmail,
            },
            relations: ['roles'],
          });
    
        //   if (user.govId !== govId) {
        //     throw new UnauthorizedException(
        //       'Access Denied, user Id does not match',
        //     );
        //   }
    
          if (user.status !== 'approved') {
            throw new UnauthorizedException('Access Denied, user unauthorized');
          }
    
          if (user && (await bcrypt.compare(password, user.password))) {
            // return await this.getJwtToken(user);
            // await this.sendOtp(user);
            // return { message: 'OTP sent to your email. Please verify to proceed.' };
            return await this.getJwtToken(user);
          } else {
            throw new UnauthorizedException('Invalid credentials');
          }
        } catch (e) {
          this.logger.error(`Login failed: ${e.message}`);
          throw new UnauthorizedException('Invalid credentials');
        }
    }

    async loginAdmins(
        govIssuedEmail: string,
        password: string,
      ): Promise<any> {
        this.logger.log(`Attempting login for user with email ${govIssuedEmail}`);
        try {
          // const user = await this.userRepository.findOne({
          //   where: [{ officialEmail: officialEmail }, { govId: govId }],
          //   relations: ['department', 'roles'],
          // });
    
          const user = await this.userRepository.findOne({
            where: {
              govIssuedEmail: govIssuedEmail
            },
            relations: [ 'roles'],
          });
          
    
          if (user && (await bcrypt.compare(password, user.password))) {
            return await this.getJwtToken(user);
            // await this.sendOtp(user);
            // return { message: 'OTP sent to your email. Please verify to proceed.' };
          } else {
            throw new UnauthorizedException('Invalid credentials');
          }
        } catch (e) {
          this.logger.error(`Login failed: ${e.message}`);
          throw new UnauthorizedException('Invalid credentials');
        }
    }

    async updatePassword(
        id: string,
        updatePasswordDto: UpdatePasswordDto,
      ): Promise<CommonResponse> {
        const user = await this.userRepository.findOne({ where: { id: id } });
    
        if (!user) {
          throw new NotFoundException('User not found');
        }
    
        const isCurrentPasswordValid = await bcrypt.compare(
          updatePasswordDto.currentPassword,
          user.password,
        );
        if (!isCurrentPasswordValid) {
          throw new UnauthorizedException('Current password is incorrect');
        }
    
        const hashedNewPassword = await bcrypt.hash(
          updatePasswordDto.newPassword,
          10,
        );
        user.password = hashedNewPassword;
        user.passwordChange = true;
    
        await this.userRepository.save(user);
    
        return {
          statusCode: 200,
          message: 'Password updated successfully',
          data: null,
        };
    }
    
    async updatePasswordNoValidation(
    updatePasswordDto: UpdatePasswordNoValidDto,
    ): Promise<CommonResponse> {
        const user = await this.userRepository.findOne({ where: { id: updatePasswordDto.id } });
    
        if (!user) {
          throw new NotFoundException('User not found');
        }
    
        const hashedNewPassword = await bcrypt.hash(
          updatePasswordDto.newPassword,
          10,
        );
        user.password = hashedNewPassword;
        user.passwordChange = true;
    
        await this.userRepository.save(user);
    
        return {
          statusCode: 200,
          message: 'Password updated successfully',
          data: null,
        };
    }

    async createRole(createRoleDto: CreateRoleDto): Promise<CommonResponse> {
        const { name, permissions } = createRoleDto;
      
        const role = this.roleRepository.create({ name });
      
        const permissionEntities = await this.permissionRepository.findBy({
          id: In(permissions),
        });
      
        role.permissions = permissionEntities;
      
        await this.roleRepository.save(role);
      
        return {
          statusCode: 201,
          message: 'Role created successfully with permissions',
          data: role,
        };
    }
    
    async createPermission(createPermissionDto: CreatePermissionDto): Promise<CommonResponse> {
        const permission = this.permissionRepository.create(createPermissionDto);
        await this.permissionRepository.save(permission);
        return {
          statusCode: 201,
          message: 'Permission created successfully',
          data: permission,
        };
    }

    async makeAdmin(userId: string): Promise<CommonResponse> {
        const user = await this.userRepository.findOne({
          where: { id: userId },
          relations: ['roles'],
        });
    
        if (!user) {
          return {
            statusCode: 404,
            message: 'User not found',
            data: null,
          };
        }
    
        const adminRole = await this.roleRepository.findOne({
          where: { name: 'admin' },
        });
    
        if (!adminRole) {
          return {
            statusCode: 404,
            message: 'Admin role not found',
            data: null,
          };
        }
    
        if (user.roles.some((role) => role.name === 'admin')) {
          return {
            statusCode: 400,
            message: 'User already has the admin role',
            data: user,
          };
        }
    
        user.roles.push(adminRole);
        await this.userRepository.save(user);
    
        return {
          statusCode: 200,
          message: 'User promoted to admin successfully',
          data: user,
        };
    }

    async createAdminRole(createRoleDto: CreateRoleDto): Promise<CommonResponse> {
        const { name, permissions } = createRoleDto;
      
        const role = this.roleRepository.create({ name });
      
        const permissionEntities = await this.permissionRepository.findBy({
          id: In(permissions),
        });
      
        role.permissions = permissionEntities;
      
        await this.roleRepository.save(role);
        return {
          statusCode: 201,
          message: 'Admin role created successfully',
          data: role,
        };
    }
    
}
