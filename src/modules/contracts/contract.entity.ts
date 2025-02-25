import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,OneToMany  } from 'typeorm';
import { Invoice } from '../invoices/invoice.entity'



@Entity('contratos') // Nombre de la tabla en Supabase
export class Contract {
    @PrimaryGeneratedColumn("increment") // ID autoincremental
    id!: number;

    @Column({ name: 'uuid_authsupa',type:'varchar',nullable:true })
    qr?: string | null;  // Puede ser opcional si Supabase lo genera

    @Column({type: 'double precision', nullable: false })
    consumo?: number; // No puede ser null y debe ser único

    @Column({type: 'double precision', nullable: false })
    total?: number; // No puede ser null y debe ser único

    @Column({ nullable: false, unique: true })
    folio?: string; // No puede ser null y debe ser único

    @Column({ nullable: true })
    pagada?: boolean; // No puede ser null y debe ser único

    @Column({ nullable: false })
    sincronizada?: boolean; // No puede ser null y debe ser único

    @Column({ name: 'fecha_lectura', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP',nullable: false})
    fechaLectura!: string; 

    @Column({name: 'lectura_actual',type: 'double precision', nullable: true })
    lecturaActual!: string; 

    @Column({name: 'lectura_anterior', type: 'double precision',  nullable: true })
    lecturaAnterior?: string;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date = new Date(); // Se genera automáticamente

    @OneToMany(() => Invoice, invoice => invoice.contract)
    invoices: Invoice[];


}
