import { Entity, PrimaryGeneratedColumn, Column, ManyToOne,OneToOne, JoinColumn } from 'typeorm';
import { Contract } from '../contracts/contract.entity'
import { User } from '../users/user.entity'; 

@Entity('facturas') // Nombre de la tabla en Supabase
export class Invoice {
    @PrimaryGeneratedColumn("increment") // ID autoincremental
    id!: number;

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

    @Column({name: 'sincronizada', type:'boolean', nullable: false })
    sincronizada?: boolean; 

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

    @ManyToOne(() => Contract, (contract) => contract.facturas, { nullable: true})
    @JoinColumn({ name: 'contrato_id' }) // Nombre de la columna FK en la BD
    contrato: Contract;

    // Relación uno a uno con la tabla public.users
    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' }) 
    usuario: User;

}
