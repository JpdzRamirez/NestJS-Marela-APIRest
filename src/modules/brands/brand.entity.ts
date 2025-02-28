import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import "reflect-metadata";

@Entity('marcas')
export class Brand {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'nombre', unique: true, nullable: false })
    nombre?: string;
}