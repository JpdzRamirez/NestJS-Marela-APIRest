import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import "reflect-metadata";

@Entity('tipo_documento')
export class TypeDocument {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'nombre', unique: true, nullable: false })
    name?: string;
}