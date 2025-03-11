import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import "reflect-metadata";

import { TypeClient } from '../type_client/type_client.entity';
import { TypeDocument } from '../type_document/type_document.entity';

@Entity('clientes')
export class Client {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'id_client',type: 'int8', nullable: false })
    id_client!: number;

    @Column({ name: 'nombre', type: 'varchar', nullable: true })
    nombre!: string;

    @Column({ name: 'apellido', type: 'varchar',nullable: true })
    apellido?: string; 

    @Column({ name: 'documento', type: 'varchar',nullable: true, unique: true })
    documento?: string; 

    @Column({ name: 'correo', type: 'varchar',nullable: true })
    correo?: string; 

    @Column({ name: 'direccion', type: 'varchar',nullable: true})
    direccion?: string; 

    @Column({ name: 'telefono', type: 'varchar',nullable: true})
    telefono?: string;  

    @Column({ name: 'uploaded_by_authsupa', type:'uuid', unique: false, nullable: true })
    uploaded_by_authsupa?: string;

    @Column({ name: 'sync_with', type: 'jsonb', nullable: true })
    sync_with?: Record<string, any>[] | null;
    
    @ManyToOne(() => TypeClient, { nullable: false, eager: false })
    @JoinColumn({ name: 'tipocliente_id' })
    tipo_cliente?: TypeClient | null;

    @ManyToOne(() => TypeDocument, { nullable: false, eager: false }) 
    @JoinColumn({ name: 'tipodocumento_id' })
    tipo_documento?: TypeDocument | null;



}