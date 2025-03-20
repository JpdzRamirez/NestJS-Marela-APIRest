import { Entity, PrimaryGeneratedColumn, Column,ManyToOne,OneToOne,JoinColumn } from 'typeorm';
import "reflect-metadata";

import { Activity } from '../activities/activity.entity';

@Entity('pagos_actividades')
export class PaymentsActivity {
    @PrimaryGeneratedColumn("increment")
    id!: number;

    @Column({ name: 'id_pagoactividades',type: 'uuid', nullable: false, unique: true })
    id_pagoactividades!: string;

    @Column({ name: 'nombre',type: 'varchar', length: 50, unique: false, nullable: false })
    nombre!: string;

    @Column({name: 'total', type: 'float4', nullable: false })
    total!: number; 

    @Column({ name: 'numero_cuotas',type: 'int2', nullable: false })
    numero_cuotas!: number;

    @Column({name: 'cuota_actual', type: 'int2', nullable: false,})
    cuota_actual!: number;

    @Column({name: 'valor_cuota_actual', type: 'float4', nullable: false })
    valor_cuota_actual!: number; 

    @Column({name: 'saldo', type: 'float4', nullable: false })
    saldo?: number; 

    @Column({name: 'pagado', type: 'bool', nullable: false })
    pagado?: Boolean; 

    @Column({ name: 'fecha_pago', type: 'timestamp'})
    fecha_pago!: Date;

    @Column({ name: 'actividad_id', type:'uuid',nullable:false })
    actividad_id?: string ; 

    @ManyToOne(() => Activity, (activity) => activity.pagos_actividad, { nullable: false,eager: false })
    @JoinColumn({ name: 'actividad_id' , referencedColumnName: 'id_actividades' }) // Nombre de la columna FK en la BD
    actividad?: Activity;

    @Column({ name: 'uploaded_by_authsupa', type:'uuid', unique: false, nullable: true })
    uploaded_by_authsupa?: string;

    @Column({ name: 'sync_with', type: 'jsonb', nullable: true })
    sync_with?: Record<string, any>[] | null;

    @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;
}