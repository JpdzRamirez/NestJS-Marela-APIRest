import { Entity, PrimaryGeneratedColumn, Column,ManyToOne,OneToMany,JoinColumn } from 'typeorm';
import "reflect-metadata";

@Entity('pie_factura')
export class InvoiceFooterController {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'nombre_empresa',type: 'varchar', length: 100, unique: false, nullable: false })
    company_name?: string;

    @Column({name: 'nit', type:'varchar', unique: true, nullable: false})
    nit?: string;

    @Column({ name: 'descripcion', type:'varchar',length: 500,nullable:true })
    description?: string | null;  

    @Column({ name: 'direccion_empresa', type:'varchar',length: 500,nullable:true })
    company_address?: string | null;  

    @Column({ name: 'telefono_empresa', type:'varchar',length: 500,nullable:true })
    company_phone?: string | null;  

    @Column({ name: 'correo_empresa', type:'varchar',length: 500,nullable:true })
    company_email?: string | null;  

    @Column({ name: 'observaciones', type:'varchar',length: 500,nullable:true })
    observations?: string | null;  

    @Column({ name: 'observaciones2', type:'varchar',length: 500,nullable:true })
    observations_2?: string | null;  

    @Column({ name: 'observaciones3', type:'varchar',length: 500,nullable:true })
    observations_3?: string | null;  
    
    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date = new Date(); 
}