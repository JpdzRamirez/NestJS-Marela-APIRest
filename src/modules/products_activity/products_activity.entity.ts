import { Entity, PrimaryGeneratedColumn, Column,ManyToOne,OneToOne,JoinColumn } from 'typeorm';
import "reflect-metadata";

import { Activity } from '../activities/activity.entity';
import { Unit } from '../units/units.entity';

@Entity('productos_actividad')
export class ProductsActivity {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'id_productosactividad',type: 'uuid', nullable: false, unique: true })
    id_productosactividad!: string;

    @Column({ name: 'nombre',type: 'varchar', length: 50, unique: false, nullable: false })
    nombre!: string;

    @Column({ name: 'stock',type: 'int2', nullable: false })
    stock!: number;

    @Column({ name: 'codigo',type: 'int2', nullable: false })
    codigo!: number;

    @Column({name: 'precio_venta', type: 'float4', nullable: false })
    precio_venta?: number; 

    @Column({ name: 'descripcion', type:'varchar',length: 300,nullable:true })
    descripcion?: string | null;  // Puede ser opcional si Supabase lo genera

    @Column({ name: 'manejo_stock', type:'boolean',nullable:true })
    manejo_stock?: boolean; 

    @Column({ name: 'producto_venta', type:'boolean',nullable:true })
    producto_venta?: boolean; 

    @Column({ name: 'unidad_id', type:'uuid',nullable:true })
    unidad_id!: string; 

    @ManyToOne(() => Unit, { nullable: true, eager: false })
    @JoinColumn({ name: 'unidad_id' , referencedColumnName: 'id_unidad' })
    unidad: Unit;

    @Column({ name: 'actividad_id', type:'uuid',nullable:false })
    actividad_id?: string ; 

    @ManyToOne(() => Activity, (activity) => activity.productos_actividad, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'actividad_id', referencedColumnName: 'id_actividades' }) // Nombre de la columna FK en la BD
    actividad: Activity;

    @Column({ name: 'uploaded_by_authsupa', type:'uuid', unique: false, nullable: true })
    uploaded_by_authsupa?: string;

    @Column({ name: 'sync_with', type: 'jsonb', nullable: true })
    sync_with?: Record<string, any>[] | null;

    @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;
}