import { Column, Entity, ManyToOne, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { CustomEntity } from './custom.entity';
import { RoleEntity } from './role.entity';

@Entity('Users')
export class UserEntity extends CustomEntity{
    @Column({ name: 'first_name', length: 255, nullable: false })
    firstName: string;

    @Column({ name: 'last_name', length: 255, nullable: false })
    lastNmae: string;

    @Column({ name: 'middle_name', length: 255, nullable: true })
    middleName: string;

    @Column({ name: 'NIN', length: 11, unique: true, nullable: false })
    NIN: string;

    @Column({ name: 'gov_issued-email', length: 255, unique: true, nullable: false })
    govIssuedEmail: string;

    @Column({ name: 'password', length: 255, unique: true, nullable: false })
    password: string

    @Column({ name: 'BVN', length: 255, unique: true, nullable: false })
    BVN: string;

    @Column({ name: 'DOB',type: 'date', nullable: true })
    DOB: Date;

    @Column({ name: 'email', length: 255, unique: true, nullable: false })
    email: string;

    @Column({ name: 'nationality', length: 255, nullable: false })
    nationality: string;

    @Column({ name: 'LGA', length: 255, nullable: false })
    LGA: string;

    @Column({ name: 'gender', length: 255, nullable: false })
    gender: string;

    @Column({ name: 'phone_number', length: 11, unique: true, nullable: false })
    phoneNumber: string;

    @Column({ name: 'address', length: 255, nullable: false })
    address: string;

    @Column({ name: 'state_of_origin', length: 255, nullable: false })
    stateOfOrigin: string;

    @Column({ name: 'religion', length: 255, nullable: false })
    religion: string;

    @Column({ name: 'tribe', length: 255, nullable: false })
    tribe: string;

    @Column({ name: 'refresh_token', nullable: true })
    refreshToken: string;

    @Column({ name: 'refresh_token_expiry', type: 'timestamp', nullable: true })
    refreshTokenExpiry: Date;

    @Column({ name: 'password_change', default: false, nullable: true })
    passwordChange: boolean;

    @Column({ name: 'otp', length: 255, nullable: true })
    otp: string;

    @Column({ name: 'otp_expiry', type: 'date', nullable: true })
    otpExpiry: Date;

    @Column({ name: 'supervisor_email', length: 255, nullable: true })
    supervisorEmail: string;

    @Column({ name: 'status', default: 'pending', length: 20 })
    status: string;

    @ManyToMany(() => RoleEntity, (role: { users: any }) => role.users)
    @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: RoleEntity[];
}