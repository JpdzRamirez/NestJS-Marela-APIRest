import { Entity, PrimaryGeneratedColumn, Column,ManyToOne,OneToOne,JoinColumn } from 'typeorm';
import "reflect-metadata";

import { TypeService } from '../type_services/type_service.entity';

@Entity('tarifas')
export class SalesRate {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'id_tarifa',type: 'uuid', nullable: false, unique: true })
    id_tarifa!: string;

    @Column({ name: 'nombre', unique: true, nullable: false })
    nombre!: string;

    @Column({ name: 'rango_final',type: 'float4', nullable: false })
    rango_final!: number;

    @Column({ name: 'rango_inicial',type: 'float4', nullable: false })
    rango_inicial!: number;

    @Column({ name: 'valor_unitario',type: 'float4', nullable: false })
    valor_unitario!: number;

    @ManyToOne(() => TypeService, (typeService) => typeService.tarifas, { nullable: true, eager:false })
    @JoinColumn({ name: 'tiposervicio_id', referencedColumnName: 'id_tiposervicio'  }) // Nombre de la columna FK en la BD
    tipo_servicio: TypeService;

    @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ name: 'uploaded_by_authsupa', type:'uuid', unique: false, nullable: true })
    uploaded_by_authsupa?: string;

    @Column({ name: 'sync_with', type: 'jsonb', nullable: true })
    sync_with?: Record<string, any>[] | null;
}