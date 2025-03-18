import { Entity, PrimaryGeneratedColumn, Column,ManyToOne,OneToOne,JoinColumn } from 'typeorm';
import "reflect-metadata";

import { Contract } from '../contracts/contract.entity'
import { Brand } from '../brands/brand.entity'

@Entity('medidores')
export class WaterMeter {
    @PrimaryGeneratedColumn("increment")
    id!: number;
    
    @Column({ name: 'id_medidor',type: 'uuid', nullable: false, unique: true })
    id_medidor!: string;

    @Column({ name: 'numero_referencia',type: 'varchar', unique: true, nullable: false })
    numero_referencia!: string;

    @Column({ name: 'tipo',type: 'varchar', length: 100, nullable: true })
    tipo?: string;

    @Column({ name: 'modelo',type: 'varchar', length: 100, nullable: true })
    modelo?: string;

    @Column({ name: 'diametro',type: 'varchar', length: 100, nullable: true })
    diametro?: string;

    @Column({ name: 'descripcion',type: 'varchar', length: 250, nullable: true })
    descripcion?: string;
    
    @ManyToOne(() => Brand, { nullable: true, eager: false })
    @JoinColumn({ name: 'marca_id', referencedColumnName: 'id_marca' })
    marca!: Brand | null;

    @ManyToOne(() => Contract, { nullable: true, eager: false})
    @JoinColumn({ name: 'contrato_id', referencedColumnName: 'id_contrato' }) 
    contrato: Contract;

    @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ name: 'uploaded_by_authsupa', type:'uuid', unique: false, nullable: true })
    uploaded_by_authsupa?: string;

    @Column({ name: 'sync_with', type: 'jsonb', nullable: true })
    sync_with?: Record<string, any>[] | null;
}