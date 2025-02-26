import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import "reflect-metadata";

@Entity('ciudades')
export class City {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'nombre', type: 'varchar',  unique: true, nullable: false })
    name?: string;

    @Column({ name: 'codigo', type: 'int2',  unique: true, nullable: false })
    code?: number;
}