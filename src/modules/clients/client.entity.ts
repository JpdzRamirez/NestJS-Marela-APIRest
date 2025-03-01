import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import "reflect-metadata";

import { TypeClient } from '../type_client/type_client.entity';
import { TypeDocument } from '../type_document/type_document.entity';

@Entity('clientes')
export class Client {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'id_mobil',type: 'int8', nullable: false })
    id_mobil?: number;

    @Column({ name: 'numero_cuotas',type: 'int8', nullable: false })
    numero_cuotas?: number;

    @Column({ name: 'nombre', type: 'varchar', nullable: true })
    nombre?: string;

    @Column({ name: 'documento', type: 'varchar',nullable: true, unique: true })
    documento?: string; 

    @Column({ name: 'apellido', type: 'varchar',nullable: true })
    apellido?: string; 

    @Column({ name: 'correo', type: 'varchar',nullable: true })
    correo?: string; 

    @Column({ name: 'direccion', type: 'varchar',nullable: true})
    direccion?: string; 

    @Column({ name: 'telefono', type: 'varchar',nullable: true})
    telefono?: string;  

    @Column({ name: 'sincronizado_mobil', type: 'bool',nullable: true})
    sincronizado_mobil?: Boolean;  

    @Column({ name: 'sincronizado_web', type: 'bool',nullable: true})
    sincronizado_web?: Boolean;  
    
    @ManyToOne(() => TypeClient, { nullable: false, eager: false })
    @JoinColumn({ name: 'tipocliente_id' })
    tipo_cliente?: TypeClient | null;

    @ManyToOne(() => TypeDocument, { nullable: false, eager: false }) 
    @JoinColumn({ name: 'tipodocumento_id' })
    tipo_documento?: TypeDocument | null;

}