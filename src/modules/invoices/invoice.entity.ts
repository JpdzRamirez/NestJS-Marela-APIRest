import { Entity, PrimaryGeneratedColumn, Column, ManyToOne,OneToOne, JoinColumn } from 'typeorm';
import { Contract } from '../contracts/contract.entity'
import { User } from '../users/user.entity'; 

@Entity('facturas') // Nombre de la tabla en Supabase
export class Invoice {
    @PrimaryGeneratedColumn("increment") // ID autoincremental
    id!: number;

    @Column({ name: 'id_factura',type: 'uuid', nullable: false, unique: true })
    id_factura!: string;

    @Column({ name: 'qr', type:'varchar',nullable:true })
    qr?: string | null;  // Puede ser opcional si Supabase lo genera

    @Column({name: 'consumo',type: 'float8', nullable: false })
    consumo?: number; 

    @Column({type: 'float8', nullable: false })
    total?: number; 

    @Column({ type: 'float8',nullable: false, unique: true })
    folio?: string; 

    @Column({name: 'pagada', type: 'boolean', nullable: true })
    pagada?: boolean; 

    @Column({ name: 'fecha_lectura', type: 'timestamp',nullable: false})
    fecha_lectura!: Date; 

    @Column({name: 'lectura_actual',type: 'float8', nullable: true })
    lectura_actual!: string; 

    @Column({name: 'lectura_anterior', type: 'float8',  nullable: true })
    lectura_anterior?: string;

    @Column({ name: 'fecha_pago', type: 'timestamp',nullable: true})
    fecha_pago?: Date; 

    @Column({ name: 'fecha_pago_oportuno', type: 'timestamp',nullable: true})
    fecha_pago_oportuno?: Date; 

    @ManyToOne(() => Contract, (contract) => contract.facturas, { nullable: true, eager: false})
    @JoinColumn({ name: 'contrato_id', referencedColumnName: 'id_contrato' }) // Nombre de la columna FK en la BD
    contrato: Contract;

    @Column({ name: 'user_id', type:'uuid',nullable:false, unique: true })
    user_id!: string; 
        
    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' , referencedColumnName: 'uuid_authsupa'}) 
    usuario: User;

    @Column({ name: 'uploaded_by_authsupa', type:'uuid', unique: false, nullable: true })
    uploaded_by_authsupa?: string;

    @Column({ name: 'sync_with', type: 'jsonb', nullable: true })
    sync_with?: Record<string, any>[] | null;

    @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;
}
