import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import "reflect-metadata";

@Entity('departamentos')
export class State {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'id_departamento',type: 'uuid', nullable: false, unique: true })
    id_departamento!: string;

    @Column({ name: 'nombre', type: 'varchar',  unique: true, nullable: false })
    nombre!: string;

    @Column({ name: 'codigo', type: 'int2',  unique: true, nullable: false })
    codigo!: number;

    @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ name: 'uploaded_by_authsupa', type:'uuid', unique: false, nullable: true })
    uploaded_by_authsupa?: string;

    @Column({ name: 'sync_with', type: 'jsonb', nullable: true })
    sync_with?: Record<string, any>[] | null;
}