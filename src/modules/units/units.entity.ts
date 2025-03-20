import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import "reflect-metadata";

@Entity('unidades')
export class Unit {
    @PrimaryGeneratedColumn("increment")
    id!: number;
    
    @Column({ name: 'id_unidad',type: 'uuid', nullable: false, unique: true })
    id_unidad!: string;

    @Column({ name: 'nombre', unique: true, nullable: true })
    nombre!: string;

    @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ name: 'uploaded_by_authsupa', type:'uuid', unique: false, nullable: true })
    uploaded_by_authsupa?: string;

    @Column({ name: 'sync_with', type: 'jsonb', nullable: true })
    sync_with?: Record<string, any>[] | null;

}