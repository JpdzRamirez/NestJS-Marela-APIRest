import { Entity, PrimaryGeneratedColumn, Column,ManyToOne,OneToOne,JoinColumn } from 'typeorm';
import "reflect-metadata";

import { TypeService } from '../type_services/type_service.entity';

@Entity('tarifas')
export class SalesRate {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'nombre', unique: true, nullable: false })
    name?: string;

    @Column({ name: 'rango_final',type: 'float4', nullable: false })
    final_range?: number;

    @Column({ name: 'rango_inicial',type: 'float4', nullable: false })
    start_range?: number;

    @Column({ name: 'valor_unitario',type: 'float4', nullable: false })
    unit_value?: number;

    @ManyToOne(() => TypeService, (typeService) => typeService.salesRates, { nullable: true })
    @JoinColumn({ name: 'tiposervicio_id' }) // Nombre de la columna FK en la BD
    typeService: TypeService;
}