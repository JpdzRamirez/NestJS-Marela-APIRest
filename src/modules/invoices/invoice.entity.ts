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
    ammount?: number; 

    @Column({type: 'float8', nullable: false })
    total?: number; 

    @Column({ type: 'float8',nullable: false, unique: true })
    folio?: string; 

    @Column({name: 'pagada', type: 'boolean', nullable: true })
    paid?: boolean; 

    @Column({name: 'sincronizada', type:'boolean', nullable: false })
    synchronized?: boolean; 

    @Column({ name: 'fecha_lectura', type: 'timestamp',nullable: false})
    date_summary!: Date; 

    @Column({name: 'lectura_actual',type: 'float8', nullable: true })
    current_summary!: string; 

    @Column({name: 'lectura_anterior', type: 'float8',  nullable: true })
    last_summary?: string;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date = new Date(); // Se genera automáticamente

    @ManyToOne(() => Contract, contract => contract.invoices, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'contrato_id' }) // Nombre de la columna FK en la BD
    contract?: Contract;

    
    @Column({ name: 'contrato_id', type: 'float8' })
    contract_Id?: number; 

    @Column({ name: 'fecha_pago', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP',nullable: false})
    payment_date!: string; 

    @Column({ name: 'fecha_pago_oportuno', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP',nullable: false})
    payment_deadline!: string; 

    // Relación uno a uno con la tabla public.users
    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' }) // Mapea la columna user_id en la tabla perfil
    user: User;

    @Column({ name: 'user_id' }) // Columna que almacena la clave foránea
    user_id: number;

}
