import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Contrato } from '../contratos/contrato.entity'

@Entity('facturas') // Nombre de la tabla en Supabase
export class Factura {
    @PrimaryGeneratedColumn("increment") // ID autoincremental
    id!: number;

    @Column({ name: 'uuid_authsupa',type:'varchar',nullable:true })
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

    @ManyToOne(() => Contrato, contrato => contrato.facturas, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'contrato_id' }) // Nombre de la columna FK en la BD
    contrato: Contrato;

}
