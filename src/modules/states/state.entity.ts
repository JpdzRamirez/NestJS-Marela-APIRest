import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import "reflect-metadata";

@Entity('departamentos')
export class State {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'id_departamento',type: 'uuid', nullable: false, unique: true })
    id_departamento!: string;

    @Column({ name: 'nombre', type: 'varchar',  unique: true, nullable: false })
    nombre?: string;

    @Column({ name: 'codigo', type: 'int2',  unique: true, nullable: false })
    codigo?: number;
}