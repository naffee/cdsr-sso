import {
    CreateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  export abstract class CustomEntity {
    @PrimaryGeneratedColumn()
    id: string;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @DeleteDateColumn()
    deletedAt: Date;
  }
  