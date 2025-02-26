import { Entity, PrimaryGeneratedColumn, Column,ManyToOne,OneToOne,JoinColumn } from 'typeorm';
import "reflect-metadata";

import { Activity } from '../activities/activity.entity';

@Entity('pagos_actividades')
export class PaymentsActivity {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'nombre',type: 'varchar', length: 50, unique: false, nullable: false })
    name?: string;

    @Column({ name: 'stock',type: 'int2', nullable: false })
    stock?: number;

    @Column({ name: 'codigo',type: 'int2', nullable: false })
    code?: number;

    @Column({name: 'fecha_actividad', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: false,})
    activity_date: Date = new Date();

    @Column({name: 'precio_venta', type: 'float4', nullable: false })
    sale_price?: number; 

    @Column({ name: 'descripcion', type:'varchar',length: 300,nullable:true })
    description?: string | null;  // Puede ser opcional si Supabase lo genera

    @Column({ name: 'manejo_stock', type:'boolean',nullable:true })
    stock_manage?: boolean; 

    @Column({ name: 'producto_venta', type:'boolean',nullable:true })
    product_sale?: boolean; 

    @Column({ name: 'unidad_id', type:'int2',nullable:true })
    unity_id?: number; 

    @ManyToOne(() => Activity, (activity) => activity.products_activity, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tiposervicio_id' }) // Nombre de la columna FK en la BD
    activity: Activity;
}