import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import "reflect-metadata";

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'name', unique: true, nullable: true })
    name?: string;
}