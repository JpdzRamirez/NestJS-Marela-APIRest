import { Entity, PrimaryGeneratedColumn, Column,ManyToOne,OneToOne,JoinColumn,OneToMany } from 'typeorm';
import "reflect-metadata";

import { City } from '../cities/city.entity';
import { State } from '../states/state.entity';
import { Contract } from '../contracts/contract.entity'

@Entity('unidad_municipal')
export class MunicipalUnit {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'id_unidadmunicipal',type: 'uuid', nullable: false, unique: true })
    id_unidadmunicipal!: string;

    @Column({ name: 'nombre',type: 'varchar', length: 50, nullable: false })
    nombre?: string;

    @ManyToOne(() => City, { nullable: false, eager: true })
    @JoinColumn({ name: 'ciudad_id' })
    ciudad?: City | null;

    @ManyToOne(() => State, { nullable: false, eager: true })
    @JoinColumn({ name: 'departamento_id' })
    departamento?: State | null;

    @OneToMany(() => Contract, (contract) => contract.unidad_municipal)
    contrato?: Contract[];
}