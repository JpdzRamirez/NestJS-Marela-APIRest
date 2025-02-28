import { Entity, PrimaryGeneratedColumn, Column,ManyToOne,OneToOne,JoinColumn } from 'typeorm';
import "reflect-metadata";

import { Activity } from '../activities/activity.entity';

@Entity('productos_actvidad')
export class ProductsActivity {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'nombre',type: 'varchar', length: 50, unique: false, nullable: false })
    nombre?: string;

    @Column({ name: 'stock',type: 'int2', nullable: false })
    stock?: number;

    @Column({ name: 'codigo',type: 'int2', nullable: false })
    codigo?: number;

    @Column({name: 'precio_venta', type: 'float4', nullable: false })
    precio_venta?: number; 

    @Column({ name: 'descripcion', type:'varchar',length: 300,nullable:true })
    descripcion?: string | null;  // Puede ser opcional si Supabase lo genera

    @Column({ name: 'manejo_stock', type:'boolean',nullable:true })
    manejo_stock?: boolean; 

    @Column({ name: 'producto_venta', type:'boolean',nullable:true })
    producto_venta?: boolean; 

    @Column({ name: 'unidad_id', type:'int2',nullable:true })
    unidad_id?: number; 

    @ManyToOne(() => Activity, (activity) => activity.productos_actividad, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'actividad_id' }) // Nombre de la columna FK en la BD
    actividad: Activity;
}