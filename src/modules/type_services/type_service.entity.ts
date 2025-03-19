import { Entity, PrimaryGeneratedColumn, Column,ManyToOne,OneToOne,JoinColumn,OneToMany } from 'typeorm';
import "reflect-metadata";

import { SalesRate } from '../sales_rate/sales_rate.entity';

@Entity('tipo_servicio')
export class TypeService {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'id_tiposervicio',type: 'uuid', nullable: false, unique: true })
    id_tiposervicio!: string;

    @Column({ name: 'nombre',type: 'varchar', length: 50, nullable: false })
    nombre!: string;
    
    @Column({ name: 'cargo_fijo',type: 'float4', nullable: false })
    cargo_fijo!: number;

    @OneToMany(() => SalesRate, (salesRate) => salesRate.tipo_servicio,{ eager: false})
    tarifas?: SalesRate[];

    @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ name: 'uploaded_by_authsupa', type:'uuid', unique: false, nullable: true })
    uploaded_by_authsupa?: string;

    @Column({ name: 'sync_with', type: 'jsonb', nullable: true })
    sync_with?: Record<string, any>[] | null;
}