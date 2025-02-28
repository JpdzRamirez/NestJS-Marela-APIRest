import { Entity, PrimaryGeneratedColumn, Column,ManyToOne,OneToMany,JoinColumn } from 'typeorm';
import "reflect-metadata";

@Entity('encabezado_factura')
export class InvoiceHeader {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'nombre_empresa',type: 'varchar', length: 100, unique: false, nullable: false })
    nombre_empresa?: string;

    @Column({name: 'nit', type:'varchar', unique: true, nullable: false})
    nit?: string;

    @Column({ name: 'descripcion', type:'varchar',length: 500,nullable:true })
    descripcion?: string | null;  

    @Column({ name: 'direccion_empresa', type:'varchar',length: 500,nullable:true })
    direccion_empresa?: string | null;  

    @Column({ name: 'telefono_empresa', type:'varchar',length: 500,nullable:true })
    telefono_empresa?: string | null;  

    @Column({ name: 'correo_empresa', type:'varchar',length: 500,nullable:true })
    correo_empresa?: string | null;  

    @Column({ name: 'observaciones', type:'varchar',length: 500,nullable:true })
    observaciones?: string | null;  

    @Column({ name: 'observaciones2', type:'varchar',length: 500,nullable:true })
    observaciones2?: string | null;  

    @Column({ name: 'observaciones3', type:'varchar',length: 500,nullable:true })
    observaciones3?: string | null;  
    
    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date = new Date(); 
}