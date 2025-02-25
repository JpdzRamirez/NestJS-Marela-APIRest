import { Entity, PrimaryGeneratedColumn, Column, ManyToOne,OneToOne, JoinColumn } from 'typeorm';
import { Contract } from '../contracts/contract.entity'
import { User } from '../users/user.entity'; 

@Entity('facturas') // Nombre de la tabla en Supabase
export class Invoice {
    @PrimaryGeneratedColumn("increment") // ID autoincremental
    id!: number;

    @Column({ name: 'qr',type:'varchar',nullable:true })
    qr?: string | null;  // Puede ser opcional si Supabase lo genera

    @Column({type: 'double precision', nullable: false })
    consumo?: number; 

    @Column({type: 'double precision', nullable: false })
    total?: number; 

    @Column({ nullable: false, unique: true })
    folio?: string; 

    @Column({ nullable: true })
    pagada?: boolean; 

    @Column({ nullable: false })
    sincronizada?: boolean; 

    @Column({ name: 'fecha_lectura', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP',nullable: false})
    fechaLectura!: string; 

    @Column({name: 'lectura_actual',type: 'double precision', nullable: true })
    lecturaActual!: string; 

    @Column({name: 'lectura_anterior', type: 'double precision',  nullable: true })
    lecturaAnterior?: string;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date = new Date(); // Se genera automáticamente

    @ManyToOne(() => Contract, contract => contract.invoices, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'contrato_id' }) // Nombre de la columna FK en la BD
    contract: Contract;

    
    @Column({ name: 'contrato_id' })
    contratoId: number; 

    @Column({ name: 'fecha_pago', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP',nullable: false})
    fechaPago!: string; 

    @Column({ name: 'fecha_pago_oportuno', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP',nullable: false})
    fechaPagoOportuno!: string; 

    // Relación uno a uno con la tabla public.users
    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' }) // Mapea la columna user_id en la tabla perfil
    user: User;

    @Column({ name: 'user_id' }) // Columna que almacena la clave foránea
    userId: number;

}
