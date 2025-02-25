import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import "reflect-metadata";

@Entity('schemas')
export class Schemas {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'name', unique: true, nullable: true })
    name?: string;
}