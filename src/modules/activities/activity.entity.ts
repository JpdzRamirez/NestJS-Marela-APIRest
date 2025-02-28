import { Entity, PrimaryGeneratedColumn, Column,ManyToOne,OneToMany,JoinColumn } from 'typeorm';
import "reflect-metadata";

import { Contract } from '../contracts/contract.entity';
import { ProductsActivity } from '../products_activity/products_activity.entity';
import { PaymentsActivity } from '../payments_activity/payments_activity.entity';

@Entity('actividades')
export class Activity {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'nombre',type: 'varchar', length: 50, unique: false, nullable: false })
    nombre?: string;

    @Column({name: 'fecha_actividad', type: 'timestamp', nullable: true,})
    fecha_actividad: Date;

    @Column({ name: 'image_bytes',type: 'int8', nullable: false })
    image_bytes?: number;

    @Column({type: 'float4', nullable: false })
    total?: number; 

    @Column({ name: 'descripcion', type:'varchar',length: 300,nullable:true })
    descripcion?: string | null;  // Puede ser opcional si Supabase lo genera

    @Column({ name: 'images', type:'json',nullable:true })
    images?: Record<string, any>; 

    @Column({ name: 'user_id', type:'int2',nullable:true })
    user_id?: number; 

    @ManyToOne(() => Contract, (contract) => contract.actividades, { nullable: true})
    @JoinColumn({ name: 'contrato_id' }) // Nombre de la columna FK en la BD
    contrato: Contract;

    @OneToMany(() => ProductsActivity, (products_activity) => products_activity.actividad,{ eager: false})
    productos_actividad?: ProductsActivity[];

    @OneToMany(() => PaymentsActivity, (payments_activity) => payments_activity.actividad,{ eager: false})
    pagos_actividad?: PaymentsActivity[];
}