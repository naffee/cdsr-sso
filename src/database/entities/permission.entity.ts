import { Column, Entity, ManyToMany } from 'typeorm';
import { CustomEntity } from './custom.entity';
import { RoleEntity } from './role.entity';

@Entity('Permissions')
export class PermissionEntity extends CustomEntity {
  @Column({ name: 'name', length: 255, unique: true })
  name: string;

  @Column({ name: 'description', length: 255 })
  description: string;

  @ManyToMany(() => RoleEntity, (role) => role.permissions)
  roles: RoleEntity[];
}
