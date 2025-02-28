import { Entity, PrimaryGeneratedColumn, Column,ManyToOne,OneToMany,JoinColumn } from 'typeorm';
import "reflect-metadata";

@Entity('pie_factura')
export class InvoiceFooter{
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

    @Column({ name: 'resolucion', type:'varchar',length: 500,nullable:true })
    resolucion?: string | null;  

    @Column({ name: 'articulo', type:'varchar',length: 500,nullable:true })
    articulo?: string | null;  

    @Column({ name: 'anio', type:'date',nullable:true })
    anio?: Date;  
    
}