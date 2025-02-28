import { Entity, PrimaryGeneratedColumn, Column,ManyToOne,OneToOne,JoinColumn } from 'typeorm';
import "reflect-metadata";

import { Activity } from '../activities/activity.entity';

@Entity('pagos_actividades')
export class PaymentsActivity {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'nombre',type: 'varchar', length: 50, unique: false, nullable: false })
    nombre?: string;

    @Column({name: 'total', type: 'float4', nullable: false })
    total?: number; 

    @Column({ name: 'numero_cuotas',type: 'int2', nullable: false })
    numero_cuotas?: number;

    @Column({name: 'cuota_actual', type: 'int2', nullable: false,})
    cuota_actual?: number;

    @Column({name: 'valor_cuota_actual', type: 'float4', nullable: false })
    valor_cuota_actual?: number; 

    @Column({name: 'saldo', type: 'float4', nullable: false })
    saldo?: number; 

    @Column({ name: 'actividad_id', type:'int2',nullable:false })
    actividad_id?: number ;  // Puede ser opcional si Supabase lo genera

    @ManyToOne(() => Activity, (activity) => activity.pagos_actividad, { nullable: false })
    @JoinColumn({ name: 'actividad_id' }) // Nombre de la columna FK en la BD
    actividad?: Activity;
}