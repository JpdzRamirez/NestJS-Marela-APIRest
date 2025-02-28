import { Entity, PrimaryGeneratedColumn, Column,ManyToOne,OneToOne,JoinColumn } from 'typeorm';
import "reflect-metadata";

import { Contract } from '../contracts/contract.entity'
import { Brand } from '../brands/brand.entity'

@Entity('medidores')
export class Meter {
    @PrimaryGeneratedColumn("increment")
    id!: number;
    
    @Column({ name: 'numero_referencia',type: 'int4', unique: true, nullable: false })
    numero_referencia?: bigint;

    @Column({ name: 'tipo',type: 'varchar', length: 100, nullable: true })
    tipo?: string;

    @Column({ name: 'modelo',type: 'varchar', length: 100, nullable: true })
    modelo?: string;

    @Column({ name: 'diametro',type: 'varchar', length: 100, nullable: true })
    diametro?: string;

    @Column({ name: 'descripcion',type: 'varchar', length: 250, nullable: true })
    descripcion?: string;
    
    @ManyToOne(() => Brand, { nullable: false, eager: false })
    @JoinColumn({ name: 'marca_id' })
    marca?: Brand | null;

    @ManyToOne(() => Contract, { nullable: false})
    @JoinColumn({ name: 'contrato_id' }) 
    contrato: Contract;
}