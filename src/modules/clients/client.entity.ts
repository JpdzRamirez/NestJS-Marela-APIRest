import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import "reflect-metadata";

import { TypeClient } from '../type_client/type_client.entity';
import { TypeDocument } from '../type_document/type_document.entity';
import { MunicipalUnit } from '../municipal_unit/municipal_unit.entity';

@Entity('clientes')
export class Client {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'id_cliente',type: 'uuid', nullable: false, unique: true })
    id_cliente!: string;

    @Column({ name: 'nombre', type: 'varchar', nullable: true })
    nombre!: string;

    @Column({ name: 'apellido', type: 'varchar',nullable: true })
    apellido?: string | null; 

    @Column({ name: 'documento', type: 'varchar',nullable: false, unique: true })
    documento!: string; 

    @Column({ name: 'correo', type: 'varchar',nullable: true })
    correo?: string; 

    @Column({ name: 'direccion', type: 'varchar',nullable: true})
    direccion?: string; 

    @Column({ name: 'telefono', type: 'varchar',nullable: true})
    telefono!: string;  

    @Column({ name: 'uploaded_by_authsupa', type:'uuid', unique: false, nullable: true })
    uploaded_by_authsupa?: string;

    @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ name: 'sync_with', type: 'jsonb', nullable: true })
    sync_with?: Record<string, any>[] | null;
    
    @ManyToOne(() => TypeClient, { nullable: true, eager: false })
    @JoinColumn({ name: 'tipocliente_id' , referencedColumnName: 'id_tipocliente' })
    tipo_cliente: TypeClient;

    @ManyToOne(() => TypeDocument, { nullable: true, eager: false }) 
    @JoinColumn({ name: 'tipodocumento_id', referencedColumnName: 'id_tipodocumento' })
    tipo_documento: TypeDocument;

    @ManyToOne(() => MunicipalUnit, { nullable: true, eager: false })
    @JoinColumn({ name: 'unidad_municipal_id' , referencedColumnName: 'id_unidadmunicipal' })
    unidad_municipal: MunicipalUnit;

}