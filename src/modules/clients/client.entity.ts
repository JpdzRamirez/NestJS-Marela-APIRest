import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import "reflect-metadata";

import { TypeClient } from '../type_client/type_client.entity';
import { TypeDocument } from '../type_document/type_document.entity';

@Entity('clientes')
export class Client {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'nombre', nullable: true })
    nombre?: string;

    @Column({ name: 'documento',nullable: true, unique: true })
    documento?: string; // No puede ser null y debe ser único

    @Column({ name: 'apellido',nullable: true })
    apellido?: string; // No puede ser null y debe ser único

    @Column({ name: 'correo',nullable: true })
    correo?: string; // No puede ser null y debe ser único

    @Column({ name: 'direccion',nullable: true})
    direccion?: string; // No puede ser null y debe ser único

    @Column({ name: 'telefono',nullable: true})
    telefono?: string; // No puede ser null y debe ser único    
    
    @ManyToOne(() => TypeClient, { nullable: false, eager: false }) // Cargar el rol automáticamente
    @JoinColumn({ name: 'tipocliente_id' })
    tipo_cliente?: TypeClient | null;

    @ManyToOne(() => TypeDocument, { nullable: false, eager: false }) // Cargar el rol automáticamente
    @JoinColumn({ name: 'tipodocumento_id' })
    tipo_documento?: TypeDocument | null;

}