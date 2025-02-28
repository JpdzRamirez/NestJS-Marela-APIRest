import { Entity, PrimaryGeneratedColumn, Column,ManyToOne,OneToOne,JoinColumn,OneToMany } from 'typeorm';
import "reflect-metadata";

import { SalesRate } from '../sales_rate/sales_rate.entity';

@Entity('tipo_servicio')
export class TypeService {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'nombre',type: 'varchar', length: 50, nullable: false })
    nombre?: string;
    
    @Column({ name: 'cargo_fijo',type: 'float4', nullable: false })
    cargo_fijo?: number;

    @OneToMany(() => SalesRate, (salesRate) => salesRate.tipo_servicio,{ eager: false})
    tarifas?: SalesRate[];
}