import { Entity, PrimaryGeneratedColumn, Column,ManyToOne,OneToOne,JoinColumn,OneToMany } from 'typeorm';
import "reflect-metadata";

import { SalesRate } from '../sales_rate/sales_rate.entity';

@Entity('tipo_servicio')
export class TypeService {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'nombre',type: 'varchar', length: 50, nullable: false })
    name?: string;
    
    @Column({ name: 'cargo_fijo',type: 'float4', nullable: false })
    default_ammount?: number;

    @OneToMany(() => SalesRate, (salesRate) => salesRate.typeService)
    salesRates?: SalesRate[];
}