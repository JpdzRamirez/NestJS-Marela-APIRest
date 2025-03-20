import { Entity, PrimaryGeneratedColumn,OneToOne, Column,ManyToOne,OneToMany,JoinColumn } from 'typeorm';
import "reflect-metadata";

import { Contract } from '../contracts/contract.entity';
import { ProductsActivity } from '../products_activity/products_activity.entity';
import { PaymentsActivity } from '../payments_activity/payments_activity.entity';

import { User } from '../users/user.entity'; 

@Entity('actividades')
export class Activity {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'id_actividades',type: 'uuid', nullable: false, unique: true })
    id_actividades!: string;

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

    @Column({ name: 'user_id', type:'uuid',nullable:false })
    user_id!: string; 

    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' , referencedColumnName: 'uuid_authsupa'}) 
    usuario: User;

    @Column({ name: 'contrato_id', type:'uuid',nullable:false })
    contrato_id!: string; 

    @ManyToOne(() => Contract, (contract) => contract.actividades, { nullable: true,eager: false})
    @JoinColumn({ name: 'contrato_id', referencedColumnName: 'id_contrato' }) // Nombre de la columna FK en la BD
    contrato: Contract;

    @OneToMany(() => ProductsActivity, (products_activity) => products_activity.actividad,{ eager: false})
    productos_actividad?: ProductsActivity[];

    @OneToMany(() => PaymentsActivity, (payments_activity) => payments_activity.actividad,{ eager: false})
    pagos_actividad?: PaymentsActivity[];

    @Column({ name: 'uploaded_by_authsupa', type:'uuid', unique: false, nullable: true })
    uploaded_by_authsupa?: string;

    @Column({ name: 'sync_with', type: 'jsonb', nullable: true })
    sync_with?: Record<string, any>[] | null;

    @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;
}