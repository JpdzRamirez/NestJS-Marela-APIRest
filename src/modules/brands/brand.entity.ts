import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import "reflect-metadata";

@Entity('marcas')
export class Brand {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'id_marca',type: 'uuid', nullable: false, unique: true })
    id_marca!: string;

    @Column({ name: 'nombre', unique: true, nullable: false })
    nombre!: string;

    @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ name: 'uploaded_by_authsupa', type:'uuid', unique: false, nullable: true })
    uploaded_by_authsupa?: string;

    @Column({ name: 'sync_with', type: 'jsonb', nullable: true })
    sync_with?: Record<string, any>[] | null;
}