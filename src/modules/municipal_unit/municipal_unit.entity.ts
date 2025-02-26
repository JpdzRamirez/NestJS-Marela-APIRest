import { Entity, PrimaryGeneratedColumn, Column,ManyToOne,OneToOne,JoinColumn,OneToMany } from 'typeorm';
import "reflect-metadata";

import { City } from '../cities/city.entity';
import { State } from '../states/state.entity';
import { Contract } from '../contracts/contract.entity'

@Entity('unidad_municipal')
export class MunicipalUnit {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'nombre',type: 'varchar', length: 50, nullable: false })
    name?: string;

    @ManyToOne(() => City, { nullable: false, eager: true })
    @JoinColumn({ name: 'ciudad_id' })
    city?: City | null;

    @ManyToOne(() => State, { nullable: false, eager: true })
    @JoinColumn({ name: 'departamento_id' })
    state?: State | null;

    @OneToMany(() => Contract, (contract) => contract.municipal_unit)
    contracts?: Contract[];
}