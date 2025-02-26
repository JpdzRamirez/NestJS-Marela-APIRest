import { Entity, PrimaryGeneratedColumn, Column,ManyToOne,OneToOne,JoinColumn } from 'typeorm';
import "reflect-metadata";

import { Contract } from '../contracts/contract.entity'
import { Brand } from '../brands/brand.entity'

@Entity('medidores')
export class Meter {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'nombre',type: 'varchar', length: 50, nullable: false })
    name?: string;
    
    @Column({ name: 'numero_referencia',type: 'int4', unique: true, nullable: false })
    reference_number?: bigint;

    @Column({ name: 'tipo',type: 'varchar', length: 100, nullable: true })
    type?: string;

    @Column({ name: 'modelo',type: 'varchar', length: 100, nullable: true })
    model?: string;

    @Column({ name: 'diametro',type: 'varchar', length: 100, nullable: true })
    diameter?: string;

    @Column({ name: 'descripcion',type: 'varchar', length: 250, nullable: true })
    description?: string;
    
    @ManyToOne(() => Brand, { nullable: false, eager: false })
    @JoinColumn({ name: 'marca_id' })
    brand?: Brand | null;

    @ManyToOne(() => Contract, { nullable: false})
    @JoinColumn({ name: 'contrato_id' }) 
    contract: Contract;
}