import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import "reflect-metadata";

import { TypeClient } from '../type_client/type_client.entity';
import { TypeDocument } from '../type_document/type_document.entity';

@Entity('clientes')
export class Client {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'nombre', nullable: true })
    name?: string;

    @Column({ name: 'documento',nullable: true, unique: true })
    document?: string; // No puede ser null y debe ser único

    @Column({ name: 'apellido',nullable: true })
    lastname?: string; // No puede ser null y debe ser único

    @Column({ name: 'correo',nullable: true })
    email?: string; // No puede ser null y debe ser único

    @Column({ name: 'direccion',nullable: true})
    address?: string; // No puede ser null y debe ser único

    @Column({ name: 'telefono',nullable: true})
    phone?: string; // No puede ser null y debe ser único    
    
    @ManyToOne(() => TypeClient, { nullable: false, eager: true }) // Cargar el rol automáticamente
    @JoinColumn({ name: 'tipocliente_id' })
    type_client?: TypeClient | null;

    @ManyToOne(() => TypeDocument, { nullable: false, eager: true }) // Cargar el rol automáticamente
    @JoinColumn({ name: 'tipodocumento_id' })
    type_document?: TypeDocument | null;

}