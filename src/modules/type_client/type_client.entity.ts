import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import "reflect-metadata";

@Entity('tipo_cliente')
export class TypeClient {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'nombre', unique: true, nullable: true })
    nombre?: string;
}