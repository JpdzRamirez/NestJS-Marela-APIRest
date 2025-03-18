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
    nombre!: string;

    @ManyToOne(() => City, { nullable: true, eager: true })
    @JoinColumn({ name: 'ciudad_id', referencedColumnName: 'id_ciudad'  })
    ciudad!: City;

    @ManyToOne(() => State, { nullable: true, eager: true })
    @JoinColumn({ name: 'departamento_id', referencedColumnName: 'id_departamento'  })
    departamento!: State;
    
    @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ name: 'uploaded_by_authsupa', type:'uuid', unique: false, nullable: true })
    uploaded_by_authsupa?: string;

    @Column({ name: 'sync_with', type: 'jsonb', nullable: true })
    sync_with?: Record<string, any>[] | null;
}